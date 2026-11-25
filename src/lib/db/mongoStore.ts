import { getDb } from "@/lib/mongodb";
import { DbStore } from "@/lib/data/store";
import { ALL_GLOBAL_UNIVERSITIES } from "@/lib/data/universities";
import { ApplicationStatus, JourneyStageStatus, MockInterviewOutcome, TaskPriority } from "@/types/database.types";
import { ActivityLogItem, DocumentVaultItem, MockInterviewItem } from "@/types/domain";

/**
 * Fetches the entire current state from MongoDB Atlas.
 */
export async function getStoreFromMongo(): Promise<DbStore> {
  const db = await getDb();

  const [
    users,
    studentProfiles,
    counselorProfiles,
    counselorAssignments,
    universities,
    applications,
    documents,
    journeyRecords,
    tasks,
    mockInterviews,
    loanCases,
    counselorInternalNotes,
    messages,
    notifications,
    activityLogs,
    adminCounselorMessages,
  ] = await Promise.all([
    db.collection("users").find({}).toArray(),
    db.collection("student_profiles").find({}).toArray(),
    db.collection("counselor_profiles").find({}).toArray(),
    db.collection("counselor_assignments").find({}).toArray(),
    db.collection("universities").find({}).toArray(),
    db.collection("applications").find({}).toArray(),
    db.collection("documents").find({}).toArray(),
    db.collection("journey_records").find({}).sort({ stageNumber: 1 }).toArray(),
    db.collection("tasks").find({}).sort({ createdAt: -1 }).toArray(),
    db.collection("mock_interviews").find({}).sort({ scheduledAt: 1 }).toArray(),
    db.collection("loan_cases").find({}).toArray(),
    db.collection("counselor_internal_notes").find({}).sort({ createdAt: -1 }).toArray(),
    db.collection("messages").find({}).sort({ createdAt: 1 }).toArray(),
    db.collection("notifications").find({}).sort({ createdAt: -1 }).toArray(),
    db.collection("activity_logs").find({}).sort({ createdAt: -1 }).toArray(),
    db.collection("admin_counselor_messages").find({}).sort({ createdAt: 1 }).toArray(),
  ]);

  // Strip MongoDB's native _id from objects to match clean domain types
  const clean = (docs: any[]) =>
    docs.map((doc) => {
      const { _id, ...rest } = doc;
      return rest;
    });

  const rawJourney = clean(journeyRecords) as any[];
  const sortedJourney = rawJourney.sort((a: any, b: any) => a.stageNumber - b.stageNumber);

  const mappedOfficialUniversities = ALL_GLOBAL_UNIVERSITIES.map((u, i) => ({
    id: u.id || `univ-${String(i + 1).padStart(2, "0")}`,
    catalogNo: u.catalogNo || (i + 1),
    name: u.name,
    country: u.country,
    city: u.city,
    campus: "Main Campus",
    ranking: u.ranking,
    qsRankDisplay: u.qsRankDisplay || `#${u.ranking}`,
    theRankDisplay: u.theRankDisplay || "Top Global",
    typeGroup: u.typeGroup || (u.russellGroup ? "Public (Russell Group)" : "Public"),
    estimatedTuition: u.estimatedTuition || u.tuitionRange1Year,
    tuitionFee: u.tuitionFee || u.tuition1Year || 25000,
    mainIntakes: u.mainIntakes || "Sep, Jan",
    typicalIelts: u.typicalIelts || u.minIelts,
    keyStrengths: u.keyStrengths || u.course,
    tier: u.tier,
    russellGroup: u.russellGroup,
    websiteUrl: u.websiteUrl,
    minCgpa: u.minCgpa || "60%",
    minIelts: u.minIelts || "6.5",
    intakeDeadlines: u.mainIntakes ? `Intakes: ${u.mainIntakes}` : "Sep, Jan: Rolling",
  }));

  const cleanUnis = clean(universities) as any[];
  const seenUni = new Set<string>();
  const deduplicatedUnis: any[] = [];
  for (const u of cleanUnis) {
    const key = u.name?.trim().toLowerCase();
    if (key && !seenUni.has(key)) {
      seenUni.add(key);
      deduplicatedUnis.push(u);
    }
  }

  let finalUniversities = deduplicatedUnis;
  if (deduplicatedUnis.length < ALL_GLOBAL_UNIVERSITIES.length || cleanUnis.length > deduplicatedUnis.length) {
    finalUniversities = mappedOfficialUniversities;
    // Asynchronously synchronize MongoDB Atlas universities collection
    db.collection("universities").deleteMany({}).then(() => {
      db.collection("universities").insertMany(mappedOfficialUniversities).catch(console.error);
    }).catch(console.error);
  }

  return {
    users: clean(users) as any,
    studentProfiles: clean(studentProfiles) as any,
    counselorProfiles: clean(counselorProfiles) as any,
    counselorAssignments: clean(counselorAssignments) as any,
    universities: finalUniversities as any,
    applications: clean(applications) as any,
    documents: clean(documents) as any,
    journeyRecords: sortedJourney as any,
    tasks: (clean(tasks) as any[]).filter(
      (t: any) => !t.title?.includes("Aspiration Questionnaire") && t.id !== "tsk-02"
    ),
    mockInterviews: clean(mockInterviews) as any,
    loanCases: clean(loanCases) as any,
    counselorInternalNotes: clean(counselorInternalNotes) as any,
    messages: clean(messages) as any,
    notifications: clean(notifications) as any,
    activityLogs: clean(activityLogs) as any,
    adminCounselorMessages: clean(adminCounselorMessages) as any,
  };
}

/**
 * Log an activity event directly in MongoDB
 */
export async function logActivityInMongo(entry: Partial<ActivityLogItem> & { action: string; title: string; description: string; role: any; userId?: string }): Promise<void> {
  try {
    const db = await getDb();
    const doc = {
      id: entry.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: entry.createdAt || new Date().toISOString(),
      ...entry,
    };
    await db.collection("activity_logs").insertOne(doc as any);
  } catch (err) {
    console.error("Failed to log activity to MongoDB:", err);
  }
}

/**
 * Update Journey Stage in MongoDB with Strict Sequential Enforcement
 */
export async function updateJourneyStageInMongo(
  studentId: string,
  stageNumber: number,
  status: JourneyStageStatus,
  counselorRemarks?: string
) {
  const db = await getDb();
  const now = new Date().toISOString();

  const updateFields: any = {
    status,
    updatedAt: now,
  };

  if (counselorRemarks !== undefined) {
    updateFields.counselorRemarks = counselorRemarks;
  }

  if (status === "completed") {
    updateFields.completionDate = now.split("T")[0];
  } else {
    updateFields.completionDate = null;
  }

  if (status === "in_progress" || status === "waiting_student" || status === "waiting_counselor" || status === "waiting_university") {
    updateFields.startDate = now.split("T")[0];
  }

  const result = await db.collection("journey_records").findOneAndUpdate(
    { studentId, stageNumber },
    { $set: updateFields },
    { returnDocument: "after" }
  );

  // Log activity
  await logActivityInMongo({
    id: `act-${Date.now()}`,
    userId: "usr-counselor-01",
    userName: "Priya Varma (Counselor)",
    role: "counselor",
    action: status === "completed" ? "JOURNEY_STAGE_COMPLETED" : "JOURNEY_STAGE_UPDATED",
    title: `Stage ${String(stageNumber).padStart(2, "0")} Updated to ${status}`,
    description: counselorRemarks || `Milestone Stage ${stageNumber} status set to ${status} in official database.`,
    affectedStudentId: studentId,
    entityType: "journey_stage",
  });

  return result;
}

/**
 * Reset and sanitize student journey records to enforce strict sequential order in MongoDB
 */
export async function sanitizeJourneyInMongo(studentId: string = "usr-student-01") {
  const db = await getDb();
  const now = new Date().toISOString();

  const stages = await db
    .collection("journey_records")
    .find({ studentId })
    .sort({ stageNumber: 1 })
    .toArray();

  if (!stages || stages.length === 0) return { success: true, count: 0 };

  let priorAllCompleted = true;
  let updatedCount = 0;

  for (const stg of stages) {
    if (priorAllCompleted) {
      if (stg.status === "completed") {
        continue;
      } else {
        priorAllCompleted = false;
        // First incomplete stage: ensure it is in_progress
        if (stg.status === "not_started") {
          await db.collection("journey_records").updateOne(
            { studentId, stageNumber: stg.stageNumber },
            { $set: { status: "in_progress", updatedAt: now } }
          );
          updatedCount++;
        }
      }
    } else {
      // All subsequent stages MUST be not_started
      if (stg.status !== "not_started") {
        await db.collection("journey_records").updateOne(
          { studentId, stageNumber: stg.stageNumber },
          {
            $set: {
              status: "not_started",
              completionDate: null,
              startDate: null,
              updatedAt: now,
            },
          }
        );
        updatedCount++;
      }
    }
  }

  return { success: true, updatedCount };
}

/**
 * Accept University Offer in MongoDB (Single Destination Binding)
 */
export async function acceptUniversityOfferInMongo(
  studentId: string,
  applicationId: string,
  acceptedByUserId: string,
  remarks?: string
) {
  const db = await getDb();
  const now = new Date().toISOString();

  // Find target application
  const targetApp = await db.collection("applications").findOne({ studentId, id: applicationId });
  if (!targetApp) {
    return { success: false, error: "Application not found." };
  }

  // 1. Mark all applications for this student as declined / not final destination
  await db.collection("applications").updateMany(
    { studentId },
    {
      $set: {
        isFinalDestination: false,
        decisionStatus: "declined",
        updatedAt: now,
      },
    }
  );

  // 2. Lock in this university as the confirmed firm choice
  await db.collection("applications").updateOne(
    { studentId, id: applicationId },
    {
      $set: {
        isFinalDestination: true,
        decisionStatus: "accepted",
        updatedAt: now,
      },
    }
  );

  // 3. Update Student Profile final destination
  await db.collection("student_profiles").updateOne(
    { id: studentId },
    {
      $set: {
        finalDestinationUniversity: targetApp.universityName,
        finalDestinationAppId: applicationId,
        updatedAt: now,
      },
    }
  );

  // 4. Update journey stage guidance notes without illegally skipping sequential stages
  // Stage 6 can ONLY be marked completed if all prior stages 1..5 are ALREADY completed!
  const priorIncomplete = await db.collection("journey_records").countDocuments({
    studentId,
    stageNumber: { $lt: 6 },
    status: { $ne: "completed" },
  });

  if (priorIncomplete === 0) {
    // Prerequisite stages 1..5 are genuinely completed, so advance Stage 6 and Stage 7
    await db.collection("journey_records").updateOne(
      { studentId, stageNumber: 6 },
      {
        $set: {
          status: "completed",
          completionDate: now.split("T")[0],
          counselorRemarks: `Student officially accepted admission offer for ${targetApp.universityName} (${targetApp.courseName}). Locked as single final destination.`,
          updatedAt: now,
        },
      }
    );

    await db.collection("journey_records").updateOne(
      { studentId, stageNumber: 7 },
      {
        $set: {
          status: "in_progress",
          counselorRemarks: `Stage 07 Tuition Deposit & Mock Interview unlocked for ${targetApp.universityName}. Required initial deposit: ${targetApp.tuitionFeeCurrency} ${targetApp.depositAmount?.toLocaleString() || "2,000"}.`,
          updatedAt: now,
        },
      }
    );
  } else {
    // Earlier stages (e.g. Stage 3 Document Collection) are still in progress!
    // Do NOT advance Stage 6 or 7 status. Update counselor guidance remarks only.
    await db.collection("journey_records").updateOne(
      { studentId, stageNumber: 6 },
      {
        $set: {
          counselorRemarks: `Admission offer received. Student designated ${targetApp.universityName} (${targetApp.courseName}) as preferred destination. Stage completes once earlier milestones are finalized.`,
          updatedAt: now,
        },
      }
    );
  }

  // 5. Log activity
  await logActivityInMongo({
    id: `act-${Date.now()}`,
    userId: acceptedByUserId,
    userName: "Rahul Sharma (Student)",
    role: "student",
    action: "OFFER_ACCEPTED",
    title: `Final Choice Accepted: ${targetApp.universityName}`,
    description: `Confirmed ${targetApp.universityName} (${targetApp.courseName}) as final destination. Downstream CAS, Visa and Deposit bound to this institution.`,
    entityType: "application",
    entityId: applicationId,
    createdAt: now,
    affectedStudentId: studentId,
    newValue: { university: targetApp.universityName, course: targetApp.courseName },
  });

  return { success: true, application: targetApp };
}

/**
 * Update Application Status in MongoDB
 */
export async function updateApplicationStatusInMongo(
  applicationId: string,
  newStatus: ApplicationStatus,
  remarks?: string,
  offerConditions?: string,
  counselorId: string = "usr-counselor-01",
  offerLetterFileName?: string,
  offerLetterUrl?: string,
  depositAmount?: number,
  depositDeadline?: string,
  tuitionFeeAmount?: number
) {
  const db = await getDb();
  const now = new Date().toISOString();

  const updateFields: any = {
    currentStatus: newStatus,
    updatedAt: now,
  };

  if (remarks !== undefined) updateFields.counselorRemarks = remarks;
  if (offerConditions !== undefined) updateFields.offerConditions = offerConditions;
  if (offerLetterFileName !== undefined) {
    updateFields.offerLetterFileName = offerLetterFileName;
    updateFields.offerLetterUploadedAt = now;
  }
  if (offerLetterUrl !== undefined) updateFields.offerLetterUrl = offerLetterUrl;
  if (depositAmount !== undefined) updateFields.depositAmount = depositAmount;
  if (depositDeadline !== undefined) updateFields.depositDeadline = depositDeadline;
  if (tuitionFeeAmount !== undefined) updateFields.tuitionFeeAmount = tuitionFeeAmount;

  if (newStatus === "conditional_offer" || newStatus === "unconditional_offer") {
    updateFields.offerType = newStatus === "conditional_offer" ? "conditional" : "unconditional";
  } else if (newStatus === "rejected") {
    updateFields.decisionStatus = "rejected";
  }

  const result = await db.collection("applications").findOneAndUpdate(
    { id: applicationId },
    { $set: updateFields },
    { returnDocument: "after" }
  );

  // If counselor uploaded an offer letter, persist it to the documents collection as well
  if (offerLetterFileName && result) {
    const docId = `doc-offer-${applicationId}`;
    const offerDoc = {
      id: docId,
      studentId: result.studentId,
      title: `${result.universityName} — ${newStatus === "unconditional_offer" ? "Unconditional" : "Conditional"} Offer Letter`,
      category: "academic",
      documentType: "offer_letter",
      latestVersion: 1,
      verificationStatus: "verified",
      fileName: offerLetterFileName,
      fileSize: 1250000,
      uploadedAt: now,
      verifiedAt: now,
      verifiedByCounselorId: counselorId,
      counselorComments: `Official admission offer letter issued directly by ${result.universityName} international admissions office.`,
      isReusable: false,
      updatedAt: now,
    };

    await db.collection("documents").updateOne(
      { id: docId },
      { $set: offerDoc as any },
      { upsert: true }
    );
  }

  if (result) {
    const isOffer = newStatus === "conditional_offer" || newStatus === "unconditional_offer";
    await logActivityInMongo({
      id: `act-${Date.now()}`,
      userId: counselorId,
      userName: "Priya Varma (Counselor)",
      role: "counselor",
      action: isOffer ? "OFFER_LETTER_UPLOADED" : "APPLICATION_STATUS_CHANGED",
      title: isOffer ? `Offer Letter Uploaded: ${result.universityName}` : `Application Status: ${result.universityName}`,
      description: remarks || (isOffer ? `Official conditional offer letter uploaded and verified.` : `Status updated to ${newStatus.replace("_", " ").toUpperCase()}`),
      entityType: "application",
      entityId: applicationId,
      createdAt: now,
      affectedStudentId: result.studentId,
      newValue: { university: result.universityName, status: newStatus, offerLetter: offerLetterFileName },
    });
  }

  return result;
}

/**
 * Shortlist University in MongoDB
 */
export async function shortlistUniversityInMongo(
  studentId: string,
  universityName: string,
  country: string,
  courseName: string,
  tuitionFee: number,
  tier: string
) {
  const db = await getDb();
  const now = new Date().toISOString();

  const newApp = {
    id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentId,
    universityId: `uni-${universityName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 8)}`,
    universityName,
    country,
    courseName,
    intake: "Fall 2026",
    appRefNumber: `GVK-${Date.now().toString().slice(-5)}`,
    tuitionFeeCurrency: "GBP",
    tuitionFeeAmount: tuitionFee,
    applicationFee: 75,
    submissionDate: now.split("T")[0],
    currentStatus: "under_review",
    offerType: "none",
    depositAmount: 2000,
    depositStatus: "pending",
    isFinalDestination: false,
    decisionStatus: "pending",
    counselorRemarks: `Shortlisted by student (${tier.toUpperCase()} tier). Counselor preparing portal documentation.`,
    updatedAt: now,
    createdAt: now,
  };

  await db.collection("applications").insertOne(newApp as any);

  await logActivityInMongo({
    id: `act-${Date.now()}`,
    userId: studentId,
    userName: "Rahul Sharma (Student)",
    role: "student",
    action: "UNIVERSITY_SHORTLISTED",
    title: `Shortlisted ${universityName}`,
    description: `Added ${universityName} (${courseName}) to active application shortlist.`,
    entityType: "application",
    entityId: newApp.id,
    createdAt: now,
    affectedStudentId: studentId,
    newValue: { university: universityName, course: courseName, tier },
  });

  return newApp;
}

/**
 * Remove Shortlisted University in MongoDB
 */
export async function removeShortlistedUniversityInMongo(studentId: string, universityName: string) {
  const db = await getDb();
  const now = new Date().toISOString();

  const app = await db.collection("applications").findOne({
    studentId,
    universityName: { $regex: new RegExp(`^${universityName}$`, "i") },
  });

  if (app) {
    await db.collection("applications").deleteOne({ id: app.id });

    await logActivityInMongo({
      id: `act-${Date.now()}`,
      userId: studentId,
      userName: "Rahul Sharma (Student)",
      role: "student",
      action: "UNIVERSITY_SHORTLIST_REMOVED",
      title: `Removed ${universityName} from Shortlist`,
      description: `Student removed ${universityName} from application targets.`,
      entityType: "application",
      entityId: app.id,
      createdAt: now,
      affectedStudentId: studentId,
      newValue: { university: universityName },
    });
  }

  return app;
}

/**
 * Create Application in MongoDB
 */
export async function createApplicationInMongo(appData: any) {
  const db = await getDb();
  const now = new Date().toISOString();

  const newApp = {
    id: appData.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentId: appData.studentId,
    universityId: appData.universityId || `uni-${(appData.universityName || "").toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 8)}`,
    universityName: appData.universityName,
    country: appData.country,
    courseName: appData.courseName,
    intake: appData.intake || "Fall 2026",
    appRefNumber: appData.appRefNumber || `GVK-${Date.now().toString().slice(-5)}`,
    tuitionFeeCurrency: appData.tuitionFeeCurrency || "GBP",
    tuitionFee: Number(appData.tuitionFeeAmount || appData.tuitionFee) || 0,
    tuitionFeeAmount: Number(appData.tuitionFeeAmount || appData.tuitionFee) || 0,
    applicationFee: 75,
    submissionDate: now.split("T")[0],
    currentStatus: appData.currentStatus || "submitted",
    offerType: "none",
    depositAmount: 2000,
    depositStatus: "pending",
    isFinalDestination: false,
    decisionStatus: "pending",
    counselorRemarks: appData.counselorRemarks || `Application created by administration.`,
    updatedAt: now,
    createdAt: now,
  };

  await db.collection("applications").updateOne(
    { id: newApp.id },
    { $set: newApp },
    { upsert: true }
  );

  return newApp;
}

/**
 * Delete Application in MongoDB
 */
export async function deleteApplicationInMongo(applicationId: string) {
  const db = await getDb();
  await db.collection("applications").deleteOne({ id: applicationId });
  return { success: true };
}

/**
 * Mark Prerequisite Stages Completed (Stages 1..4) in MongoDB
 */
export async function markPrerequisiteStagesCompletedInMongo(studentId: string, counselorRemarks?: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  // Mark all stages 1, 2, 3, 4 as completed
  await db.collection("journey_records").updateMany(
    { studentId, stageNumber: { $lte: 4 } },
    {
      $set: {
        status: "completed",
        completionDate: today,
        counselorRemarks: counselorRemarks || "Marked completed via offline counseling, in-office document review & offline university shortlisting.",
        updatedAt: now,
      },
    }
  );

  // Advance Stage 5 (Application Submission) to in_progress if not_started
  await db.collection("journey_records").updateOne(
    { studentId, stageNumber: 5, status: "not_started" },
    {
      $set: {
        status: "in_progress",
        startDate: today,
        updatedAt: now,
      },
    }
  );

  return { success: true };
}

/**
 * Mark Stage Offline Completed in MongoDB (and complete any prior incomplete stages)
 */
export async function markStageOfflineCompletedInMongo(studentId: string, targetStageNumber: number, customRemarks?: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  // Mark all stages <= targetStageNumber as completed so sequential integrity holds
  await db.collection("journey_records").updateMany(
    { studentId, stageNumber: { $lte: targetStageNumber } },
    {
      $set: {
        status: "completed",
        completionDate: today,
        counselorRemarks: customRemarks || `Stage marked completed via offline/in-office verification.`,
        updatedAt: now,
      },
    }
  );

  // Advance next stage to in_progress if not_started
  await db.collection("journey_records").updateOne(
    { studentId, stageNumber: targetStageNumber + 1, status: "not_started" },
    {
      $set: {
        status: "in_progress",
        startDate: today,
        updatedAt: now,
      },
    }
  );

  return { success: true };
}

/**
 * Upload Document to MongoDB
 */
export async function uploadDocumentInMongo(doc: DocumentVaultItem) {
  const db = await getDb();
  const now = new Date().toISOString();

  const newDoc = {
    ...doc,
    uploadedAt: now,
    updatedAt: now,
  };

  await db.collection("documents").updateOne(
    { id: doc.id },
    { $set: newDoc as any },
    { upsert: true }
  );

  await logActivityInMongo({
    id: `act-${Date.now()}`,
    userId: doc.studentId,
    userName: "Rahul Sharma (Student)",
    role: "student",
    action: "DOCUMENT_UPLOADED",
    title: `Student Uploaded Document: ${doc.title}`,
    description: `Uploaded file "${doc.fileName || "document.pdf"}" (v${doc.latestVersion}) in ${doc.category} vault. Instant notification sent to counselor for review.`,
    entityType: "document",
    entityId: doc.id,
    createdAt: now,
    affectedStudentId: doc.studentId,
    newValue: { title: doc.title, category: doc.category, version: doc.latestVersion },
  });

  return newDoc;
}

/**
 * Review & Verify Document in MongoDB
 */
export async function reviewDocumentInMongo(
  documentId: string,
  studentId: string,
  decision: "verified" | "rejected" | "action_required",
  counselorComments: string,
  counselorId: string = "usr-counselor-01"
) {
  const db = await getDb();
  const now = new Date().toISOString();

  const result = await db.collection("documents").findOneAndUpdate(
    { id: documentId },
    {
      $set: {
        verificationStatus: decision,
        counselorComments,
        verifiedAt: decision === "verified" ? now : undefined,
        verifiedByCounselorId: counselorId,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );

  if (result) {
    await logActivityInMongo({
      id: `act-${Date.now()}`,
      userId: counselorId,
      userName: "Priya Varma (Counselor)",
      role: "counselor",
      action: "DOCUMENT_REVIEWED",
      title: `Document ${decision.toUpperCase()}: ${result.title}`,
      description: counselorComments || `Counselor marked document as ${decision.toUpperCase()}`,
      entityType: "document",
      entityId: documentId,
      createdAt: now,
      affectedStudentId: studentId,
      newValue: { title: result.title, status: decision },
    });
  }

  return result;
}

/**
 * Create Task in MongoDB
 */
export async function createTaskInMongo(task: any) {
  const db = await getDb();
  const now = new Date().toISOString();

  const newTask = {
    ...task,
    id: task.id || `tsk-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("tasks").insertOne(newTask as any);

  await logActivityInMongo({
    id: `act-${Date.now()}`,
    userId: task.assignedByUserId || "usr-counselor-01",
    userName: task.assignedByName || "Priya Varma (Counselor)",
    role: "counselor",
    action: "TASK_CREATED",
    title: `New Action Item: ${task.title}`,
    description: task.description || `Assigned task with due date ${task.dueDate}`,
    entityType: "task",
    entityId: newTask.id,
    createdAt: now,
    affectedStudentId: task.studentId,
    newValue: { priority: task.priority, dueDate: task.dueDate },
  });

  return newTask;
}

/**
 * Submit Task in MongoDB
 */
export async function submitTaskInMongo(taskId: string, notes?: string, studentId: string = "usr-student-01") {
  const db = await getDb();
  const now = new Date().toISOString();

  const result = await db.collection("tasks").findOneAndUpdate(
    { id: taskId },
    {
      $set: {
        status: "submitted",
        studentSubmissionNotes: notes,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );

  if (result) {
    await logActivityInMongo({
      id: `act-${Date.now()}`,
      userId: studentId,
      userName: "Rahul Sharma (Student)",
      role: "student",
      action: "TASK_SUBMITTED",
      title: `Task Completed: ${result.title}`,
      description: notes || `Student submitted completed action item for counselor verification.`,
      entityType: "task",
      entityId: taskId,
      createdAt: now,
      affectedStudentId: result.studentId,
      newValue: { title: result.title },
    });
  }

  return result;
}

/**
 * Complete Task by Counselor in MongoDB
 */
export async function completeTaskInMongo(taskId: string, counselorId: string = "usr-counselor-01") {
  const db = await getDb();
  const now = new Date().toISOString();

  const result = await db.collection("tasks").findOneAndUpdate(
    { id: taskId },
    {
      $set: {
        status: "completed",
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );

  if (result) {
    await logActivityInMongo({
      id: `act-${Date.now()}`,
      userId: counselorId,
      userName: "Priya Varma (Counselor)",
      role: "counselor",
      action: "TASK_COMPLETED",
      title: `Task Verified & Completed: ${result.title}`,
      description: `Counselor signed off and marked task as completed.`,
      entityType: "task",
      entityId: taskId,
      createdAt: now,
      affectedStudentId: result.studentId || "usr-student-01",
      newValue: "completed",
    });
  }

  return result;
}

/**
 * Schedule Mock Interview in MongoDB
 */
export async function scheduleMockInterviewInMongo(session: any) {
  const db = await getDb();
  const now = new Date().toISOString();

  const newSession = {
    ...session,
    id: session.id || `mock-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("mock_interviews").insertOne(newSession as any);

  await logActivityInMongo({
    id: `act-${Date.now()}`,
    userId: session.counselorId || "usr-counselor-01",
    userName: "Priya Varma (Counselor)",
    role: "counselor",
    action: "MOCK_INTERVIEW_SCHEDULED",
    title: `Mock Interview Scheduled: ${session.sessionTitle}`,
    description: `Scheduled for ${session.scheduledAt} with automated Zoom URL.`,
    entityType: "mock_interview",
    entityId: newSession.id,
    createdAt: now,
    affectedStudentId: session.studentId,
    newValue: { scheduledAt: session.scheduledAt, zoomUrl: session.zoomJoinUrl },
  });

  return newSession;
}

/**
 * Evaluate Mock Interview in MongoDB
 */
export async function evaluateMockInterviewInMongo(
  interviewId: string,
  outcome: MockInterviewOutcome,
  feedbackNotes: string,
  rating: number = 8
) {
  const db = await getDb();
  const now = new Date().toISOString();

  const result = await db.collection("mock_interviews").findOneAndUpdate(
    { id: interviewId },
    {
      $set: {
        status: "completed",
        outcome,
        feedbackNotes,
        rating,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );

  if (result) {
    await logActivityInMongo({
      id: `act-${Date.now()}`,
      userId: result.counselorId || "usr-counselor-01",
      userName: "Priya Varma (Counselor)",
      role: "counselor",
      action: "MOCK_INTERVIEW_EVALUATED",
      title: `Mock Interview Result: ${outcome.toUpperCase()}`,
      description: feedbackNotes || `Outcome: ${outcome.toUpperCase()} (${rating}/10)`,
      entityType: "mock_interview",
      entityId: interviewId,
      createdAt: now,
      affectedStudentId: result.studentId,
      newValue: { outcome, rating },
    });
  }

  return result;
}

/**
 * Update Education Loan Stage in MongoDB
 */
export async function updateLoanStageInMongo(
  studentId: string,
  stage: string,
  lenderName?: string,
  amountRequested?: number,
  counselorNotes?: string,
  sanctionAmount?: number,
  studentNextStep?: string,
  counselorId: string = "usr-counselor-01"
) {
  const db = await getDb();
  const now = new Date().toISOString();

  if (stage === "not_started") {
    await db.collection("loan_cases").deleteMany({ studentId });
    return null;
  }

  const updateFields: any = {
    stage,
    updatedAt: now,
  };
  if (lenderName) updateFields.lenderName = lenderName;
  if (amountRequested) updateFields.amountRequested = amountRequested;
  if (counselorNotes !== undefined) updateFields.counselorNotes = counselorNotes;
  if (sanctionAmount !== undefined) updateFields.sanctionAmount = sanctionAmount;
  if (studentNextStep !== undefined) updateFields.studentNextStep = studentNextStep;

  const result = await db.collection("loan_cases").findOneAndUpdate(
    { studentId },
    {
      $set: updateFields,
      $setOnInsert: {
        id: `loan-${Date.now()}`,
        studentId,
        counselorId,
        interestRate: 10.25,
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  await logActivityInMongo({
    id: `act-${Date.now()}`,
    userId: counselorId,
    userName: "Priya Varma (Counselor)",
    role: "counselor",
    action: "LOAN_STAGE_UPDATED",
    title: `Loan Stage: ${stage.replace(/_/g, " ").toUpperCase()}`,
    description: counselorNotes || `Banking pipeline updated to stage ${stage.toUpperCase()}`,
    entityType: "loan",
    entityId: result?.id || "loan-case",
    createdAt: now,
    affectedStudentId: studentId,
    newValue: { stage, sanctionAmount, lenderName },
  });

  return result;
}

/**
 * Send Message in MongoDB
 */
export async function sendMessageInMongo(message: any, notification?: any) {
  const db = await getDb();
  const now = new Date().toISOString();

  const newMsg = {
    ...message,
    id: message.id || `msg-${Date.now()}`,
    isRead: message.isRead === true ? true : false,
    createdAt: message.createdAt || now,
  };

  await db.collection("messages").insertOne(newMsg as any);

  if (notification) {
    const notifDoc = {
      ...notification,
      id: notification.id || `notif-${Date.now()}`,
      isRead: false,
      createdAt: notification.createdAt || now,
    };
    await db.collection("notifications").insertOne(notifDoc as any);
  }

  return newMsg;
}



/**
 * Add Confidential Counselor Internal Note in MongoDB
 */
export async function addInternalNoteInMongo(note: any) {
  const db = await getDb();
  const now = new Date().toISOString();

  const newNote = {
    ...note,
    id: note.id || `note-${Date.now()}`,
    createdAt: now,
  };

  await db.collection("counselor_internal_notes").insertOne(newNote as any);
  return newNote;
}

/**
 * Create a new Counselor in MongoDB (Admin Action)
 */
export async function createCounselorInMongo(counselorUser: any, counselorProfile: any) {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.collection("users").insertOne({
    ...counselorUser,
    createdAt: now,
    updatedAt: now,
  } as any);

  await db.collection("counselor_profiles").insertOne({
    ...counselorProfile,
    createdAt: now,
    updatedAt: now,
  } as any);

  await logActivityInMongo({
    userId: "usr-admin-01",
    userName: "GVK Admissions Admin",
    role: "admin",
    action: "COUNSELOR_PROVISIONED",
    title: `Counselor Created: ${counselorProfile.firstName} ${counselorProfile.lastName}`,
    description: `Admin provisioned counselor ${counselorProfile.employeeIdCode} (${counselorUser.email}).`,
    entityType: "counselor_profile",
    entityId: counselorProfile.id,
    newValue: { employeeIdCode: counselorProfile.employeeIdCode, email: counselorUser.email },
  });

  return { counselorUser, counselorProfile };
}

/**
 * Create a new Student in MongoDB (Admin Action)
 */
export async function createStudentInMongo(
  studentUser: any,
  studentProfile: any,
  journeyRecords: any[],
  assignment?: any,
  tasks?: any[],
  notification?: any
) {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.collection("users").insertOne({
    ...studentUser,
    createdAt: now,
    updatedAt: now,
  } as any);

  await db.collection("student_profiles").insertOne({
    ...studentProfile,
    createdAt: now,
    updatedAt: now,
  } as any);

  if (journeyRecords && journeyRecords.length > 0) {
    await db.collection("journey_records").insertMany(journeyRecords as any);
  }

  if (assignment) {
    await db.collection("counselor_assignments").insertOne({
      ...assignment,
      createdAt: now,
      updatedAt: now,
    } as any);
  }

  if (tasks && tasks.length > 0) {
    await db.collection("tasks").insertMany(tasks as any);
  }

  if (notification) {
    await db.collection("notifications").insertOne(notification as any);
  }

  await logActivityInMongo({
    userId: "usr-admin-01",
    userName: "GVK Admissions Admin",
    role: "admin",
    action: "STUDENT_PROVISIONED",
    title: `Student Enrolled: ${studentProfile.firstName} ${studentProfile.lastName}`,
    description: `Admin enrolled student ${studentProfile.studentIdCode} (${studentUser.email}) for ${studentProfile.targetDegree}.`,
    affectedStudentId: studentProfile.id,
    entityType: "student_profile",
    entityId: studentProfile.id,
    newValue: { studentIdCode: studentProfile.studentIdCode, email: studentUser.email },
  });

  return { studentUser, studentProfile };
}

/**
 * Assign or reassign Student to Counselor in MongoDB (Admin Action)
 */
export async function assignCounselorInMongo(
  studentId: string,
  counselorId: string,
  tasks?: any[]
) {
  const db = await getDb();
  const now = new Date().toISOString();

  // Deactivate prior assignments
  await db.collection("counselor_assignments").updateMany(
    { studentId },
    { $set: { isActive: false, updatedAt: now } }
  );

  // Insert new active assignment
  await db.collection("counselor_assignments").insertOne({
    counselorId,
    studentId,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  } as any);

  // Ensure Stage 1 is in_progress
  await db.collection("journey_records").updateOne(
    { studentId, stageNumber: 1 },
    { $set: { status: "in_progress", startDate: now.split("T")[0], updatedAt: now } }
  );

  if (tasks && tasks.length > 0) {
    await db.collection("tasks").insertMany(tasks as any);
  }

  await logActivityInMongo({
    userId: "usr-admin-01",
    userName: "GVK Admissions Admin",
    role: "admin",
    action: "COUNSELOR_ASSIGNED",
    title: "Counselor Allocation Updated",
    description: `Admin assigned candidate ${studentId} to counselor ${counselorId}.`,
    affectedStudentId: studentId,
    entityType: "counselor_assignment",
    newValue: { counselorId, studentId },
  });

  return { success: true };
}

/**
 * Mark a single Notification as Read in MongoDB
 */
export async function markNotificationReadInMongo(notificationId: string) {
  const db = await getDb();
  await db.collection("notifications").updateOne(
    { id: notificationId },
    { $set: { isRead: true, readAt: new Date().toISOString() } }
  );
  return { success: true };
}

/**
 * Mark All Notifications as Read in MongoDB
 */
export async function markAllNotificationsReadInMongo(userId?: string, role?: string) {
  const db = await getDb();
  const filter: any = {};
  if (role !== "admin" && userId && userId !== "admin" && userId !== "usr-admin-01") {
    filter.userId = userId;
  }
  await db.collection("notifications").updateMany(
    filter,
    { $set: { isRead: true, readAt: new Date().toISOString() } }
  );
  return { success: true };
}

/**
 * Mark Student's Incoming Messages as Read in MongoDB
 */
export async function markStudentMessagesReadInMongo(studentId: string, counselorId?: string) {
  const db = await getDb();
  const filter: any = { studentId, senderRole: "counselor" };
  if (counselorId) filter.counselorId = counselorId;
  await db.collection("messages").updateMany(
    filter,
    { $set: { isRead: true, readAt: new Date().toISOString() } }
  );
  return { success: true };
}

/**
 * Mark Counselor's Incoming Messages as Read in MongoDB
 */
export async function markCounselorMessagesReadInMongo(counselorId: string, studentId?: string) {
  const db = await getDb();
  const filter: any = { counselorId, senderRole: "student" };
  if (studentId) filter.studentId = studentId;

  await db.collection("messages").updateMany(
    filter,
    { $set: { isRead: true, readAt: new Date().toISOString() } }
  );

  if (!studentId) {
    await db.collection("admin_counselor_messages").updateMany(
      { counselorId, senderRole: "admin" },
      { $set: { isRead: true, readAt: new Date().toISOString() } }
    );
  }
  return { success: true };
}

/**
 * Mark Admin Counselor Messages as Read in MongoDB
 */
export async function markAdminCounselorMessagesReadInMongo(counselorId?: string) {
  const db = await getDb();
  const filter: any = { senderRole: "counselor" };
  if (counselorId) filter.counselorId = counselorId;

  await db.collection("admin_counselor_messages").updateMany(
    filter,
    { $set: { isRead: true, readAt: new Date().toISOString() } }
  );
  return { success: true };
}

/**
 * Send Admin <-> Counselor Message in MongoDB
 */
export async function sendAdminCounselorMessageInMongo(message: any, notification?: any) {
  const db = await getDb();
  const now = new Date().toISOString();

  const newMsg = {
    ...message,
    id: message.id || `acmsg-${Date.now()}`,
    isRead: message.isRead === true ? true : false,
    createdAt: message.createdAt || now,
  };

  await db.collection("admin_counselor_messages").insertOne(newMsg as any);

  if (notification) {
    const notifDoc = {
      ...notification,
      id: notification.id || `notif-${Date.now()}`,
      isRead: false,
      createdAt: notification.createdAt || now,
    };
    await db.collection("notifications").insertOne(notifDoc as any);
  }

  return newMsg;
}

/**
 * Send Peer Counselor Message in MongoDB
 */
export async function sendCounselorPeerMessageInMongo(message: any, notification?: any) {
  const db = await getDb();
  const now = new Date().toISOString();

  const newMsg = {
    ...message,
    id: message.id || `cpm-${Date.now()}`,
    isRead: message.isRead === true ? true : false,
    createdAt: message.createdAt || now,
  };

  await db.collection("counselor_peer_messages").insertOne(newMsg as any);

  if (notification) {
    const notifDoc = {
      ...notification,
      id: notification.id || `notif-${Date.now()}`,
      isRead: false,
      createdAt: notification.createdAt || now,
    };
    await db.collection("notifications").insertOne(notifDoc as any);
  }

  return newMsg;
}

/**
 * Mark Peer Counselor Messages as Read in MongoDB
 */
export async function markCounselorPeerMessagesReadInMongo(currentCounselorId: string, peerCounselorId: string) {
  const db = await getDb();
  await db.collection("counselor_peer_messages").updateMany(
    { recipientId: currentCounselorId, senderId: peerCounselorId, isRead: { $ne: true } },
    { $set: { isRead: true } }
  );
  return { success: true };
}

/**
 * Update University Parameters in MongoDB Atlas
 */
export async function updateUniversityInMongo(id: string, updates: any) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.collection("universities").updateOne(
    { id },
    { $set: { ...updates, updatedAt: now } },
    { upsert: false }
  );
  await logActivityInMongo({
    userId: "usr-admin-01",
    role: "admin",
    action: "UNIVERSITY_UPDATED",
    title: `University Updated: ${updates.name || id}`,
    description: `Admin updated institutional details, tuition fee, ranking, and entry benchmarks.`,
    entityType: "university",
    entityId: id,
  });
  return { success: true };
}



