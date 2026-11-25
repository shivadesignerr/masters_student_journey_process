import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dataStore } from "@/lib/data/store";

const provisionSchema = z.object({
  email: z.string().email(),
  role: z.enum(["student", "counselor"]),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10),
  preferredCountry: z.string().optional().default("United Kingdom"),
  targetIntake: z.string().optional().default("Fall 2026"),
  targetDegree: z.string().optional().default("Masters Abroad"),
  assignedCounselorId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Admin Secret Key
    const authHeader = req.headers.get("authorization");
    const adminSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-role-key-gvkedutech-admin";

    if (!authHeader || !authHeader.includes(adminSecret)) {
      return NextResponse.json(
        { error: "Unauthorized: Admin authorization header required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = provisionSchema.parse(body);

    const generatedId = `usr-${validated.role}-${Date.now()}`;
    const codePrefix = validated.role === "student" ? "GVK-STU-2026" : "GVK-EMP";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const identifierCode = `${codePrefix}-${randomNum}`;
    const activationToken = `GVK-ACT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Record immutable audit entry
    dataStore.logActivity({
      userId: "usr-admin-01",
      role: "admin",
      action: `${validated.role.toUpperCase()}_ACCOUNT_PROVISIONED`,
      affectedStudentId: validated.role === "student" ? generatedId : undefined,
      entityType: "user_account",
      entityId: generatedId,
      newValue: {
        identifierCode,
        email: validated.email,
        role: validated.role,
        fullName: `${validated.firstName} ${validated.lastName}`,
      },
      context: { activationToken },
    });

    return NextResponse.json({
      success: true,
      message: `Account provisioned successfully for ${validated.firstName} ${validated.lastName}`,
      data: {
        userId: generatedId,
        identifierCode,
        role: validated.role,
        activationToken,
        activationUrl: `/auth/activate?token=${activationToken}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to provision account." },
      { status: 400 }
    );
  }
}
