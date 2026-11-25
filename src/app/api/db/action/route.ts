import { NextRequest, NextResponse } from "next/server";
import {
  acceptUniversityOfferInMongo,
  addInternalNoteInMongo,
  assignCounselorInMongo,
  completeTaskInMongo,
  createCounselorInMongo,
  createStudentInMongo,
  createTaskInMongo,
  evaluateMockInterviewInMongo,
  logActivityInMongo,
  markAdminCounselorMessagesReadInMongo,
  markAllNotificationsReadInMongo,
  markCounselorMessagesReadInMongo,
  markCounselorPeerMessagesReadInMongo,
  markNotificationReadInMongo,
  markStudentMessagesReadInMongo,
  removeShortlistedUniversityInMongo,
  reviewDocumentInMongo,
  sanitizeJourneyInMongo,
  scheduleMockInterviewInMongo,
  sendAdminCounselorMessageInMongo,
  sendCounselorPeerMessageInMongo,
  sendMessageInMongo,
  shortlistUniversityInMongo,
  submitTaskInMongo,
  updateApplicationStatusInMongo,
  updateJourneyStageInMongo,
  updateLoanStageInMongo,
  uploadDocumentInMongo,
  updateUniversityInMongo,
  createApplicationInMongo,
  deleteApplicationInMongo,
  markPrerequisiteStagesCompletedInMongo,
  markStageOfflineCompletedInMongo,
} from "@/lib/db/mongoStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    let result: any = null;

    switch (action) {
      case "sanitize_journey": {
        const { studentId } = payload || {};
        result = await sanitizeJourneyInMongo(studentId || "usr-student-01");
        break;
      }

      case "update_journey_stage": {
        const { studentId, stageNumber, status, counselorRemarks } = payload;
        result = await updateJourneyStageInMongo(studentId, stageNumber, status, counselorRemarks);
        break;
      }

      case "accept_offer": {
        const { studentId, applicationId, acceptedByUserId, remarks } = payload;
        result = await acceptUniversityOfferInMongo(studentId, applicationId, acceptedByUserId, remarks);
        break;
      }

      case "update_application_status": {
        const {
          applicationId,
          newStatus,
          remarks,
          offerConditions,
          counselorId,
          offerLetterFileName,
          offerLetterUrl,
          depositAmount,
          depositDeadline,
          tuitionFeeAmount,
        } = payload;
        result = await updateApplicationStatusInMongo(
          applicationId,
          newStatus,
          remarks,
          offerConditions,
          counselorId,
          offerLetterFileName,
          offerLetterUrl,
          depositAmount,
          depositDeadline,
          tuitionFeeAmount
        );
        break;
      }

      case "shortlist_university": {
        const { studentId, universityName, country, courseName, tuitionFee, tier } = payload;
        result = await shortlistUniversityInMongo(studentId, universityName, country, courseName, tuitionFee, tier);
        break;
      }

      case "remove_shortlisted_university": {
        const { studentId, universityName } = payload;
        result = await removeShortlistedUniversityInMongo(studentId, universityName);
        break;
      }

      case "create_application": {
        const { application } = payload;
        result = await createApplicationInMongo(application);
        break;
      }

      case "delete_application": {
        const { applicationId } = payload;
        result = await deleteApplicationInMongo(applicationId);
        break;
      }

      case "mark_prerequisite_stages_completed": {
        const { studentId, counselorRemarks } = payload;
        result = await markPrerequisiteStagesCompletedInMongo(studentId, counselorRemarks);
        break;
      }

      case "mark_stage_offline_completed": {
        const { studentId, stageNumber, counselorRemarks } = payload;
        result = await markStageOfflineCompletedInMongo(studentId, stageNumber, counselorRemarks);
        break;
      }

      case "update_university": {
        const { id, updates } = payload;
        result = await updateUniversityInMongo(id, updates);
        break;
      }

      case "upload_document": {
        const { document } = payload;
        result = await uploadDocumentInMongo(document);
        break;
      }

      case "review_document": {
        const { documentId, studentId, decision, counselorComments, counselorId } = payload;
        result = await reviewDocumentInMongo(documentId, studentId, decision, counselorComments, counselorId);
        break;
      }

      case "create_task": {
        const { task } = payload;
        result = await createTaskInMongo(task);
        break;
      }

      case "submit_task": {
        const { taskId, notes, studentId } = payload;
        result = await submitTaskInMongo(taskId, notes, studentId);
        break;
      }

      case "complete_task": {
        const { taskId, counselorId } = payload;
        result = await completeTaskInMongo(taskId, counselorId);
        break;
      }

      case "schedule_mock_interview": {
        const { session } = payload;
        result = await scheduleMockInterviewInMongo(session);
        break;
      }

      case "evaluate_mock_interview": {
        const { interviewId, outcome, feedbackNotes, rating } = payload;
        result = await evaluateMockInterviewInMongo(interviewId, outcome, feedbackNotes, rating);
        break;
      }

      case "update_loan_stage": {
        const {
          studentId,
          stage,
          lenderName,
          amountRequested,
          counselorNotes,
          sanctionAmount,
          studentNextStep,
          counselorId,
        } = payload;
        result = await updateLoanStageInMongo(
          studentId,
          stage,
          lenderName,
          amountRequested,
          counselorNotes,
          sanctionAmount,
          studentNextStep,
          counselorId
        );
        break;
      }

      case "send_message": {
        const { message, notification } = payload;
        result = await sendMessageInMongo(message, notification);
        break;
      }

      case "send_admin_counselor_message": {
        const { message, notification } = payload;
        result = await sendAdminCounselorMessageInMongo(message, notification);
        break;
      }

      case "send_counselor_peer_message": {
        const { message, notification } = payload;
        result = await sendCounselorPeerMessageInMongo(message, notification);
        break;
      }

      case "mark_notification_read": {
        const { notificationId } = payload;
        result = await markNotificationReadInMongo(notificationId);
        break;
      }

      case "mark_all_notifications_read": {
        const { userId, role } = payload;
        result = await markAllNotificationsReadInMongo(userId, role);
        break;
      }

      case "mark_student_messages_read": {
        const { studentId, counselorId } = payload;
        result = await markStudentMessagesReadInMongo(studentId, counselorId);
        break;
      }

      case "mark_counselor_messages_read": {
        const { counselorId, studentId } = payload;
        result = await markCounselorMessagesReadInMongo(counselorId, studentId);
        break;
      }

      case "mark_admin_counselor_messages_read": {
        const { counselorId } = payload;
        result = await markAdminCounselorMessagesReadInMongo(counselorId);
        break;
      }

      case "mark_counselor_peer_messages_read": {
        const { currentCounselorId, peerCounselorId } = payload;
        result = await markCounselorPeerMessagesReadInMongo(currentCounselorId, peerCounselorId);
        break;
      }

      case "add_internal_note": {
        const { note } = payload;
        result = await addInternalNoteInMongo(note);
        break;
      }

      case "log_activity": {
        const { entry } = payload;
        await logActivityInMongo(entry);
        result = { success: true };
        break;
      }

      case "create_counselor": {
        const { counselorUser, counselorProfile } = payload;
        result = await createCounselorInMongo(counselorUser, counselorProfile);
        break;
      }

      case "create_student": {
        const { studentUser, studentProfile, journeyRecords, assignment, tasks, notification } = payload;
        if (global.__GVK_STORE__) {
          if (studentUser && !global.__GVK_STORE__.users.some((u) => u.id === studentUser.id)) {
            global.__GVK_STORE__.users.push(studentUser);
          }
          if (studentProfile && !global.__GVK_STORE__.studentProfiles.some((s) => s.id === studentProfile.id)) {
            global.__GVK_STORE__.studentProfiles.push(studentProfile);
          }
          if (journeyRecords && Array.isArray(journeyRecords)) {
            global.__GVK_STORE__.journeyRecords.push(...journeyRecords);
          }
          if (assignment) {
            global.__GVK_STORE__.counselorAssignments.push(assignment);
          }
          if (tasks && Array.isArray(tasks)) {
            global.__GVK_STORE__.tasks.push(...tasks);
          }
          if (notification) {
            global.__GVK_STORE__.notifications.push(notification);
          }
        }
        try {
          result = await createStudentInMongo(studentUser, studentProfile, journeyRecords, assignment, tasks, notification);
        } catch (e) {
          console.warn("[Mongo create_student offline]:", e);
        }
        break;
      }

      case "activate_student": {
        const { activationCode, newPassword } = payload;
        if (global.__GVK_STORE__) {
          const cleanCode = (activationCode || "").trim().toUpperCase();
          const studentProfile = global.__GVK_STORE__.studentProfiles.find(
            (s: any) => s.activationCode && s.activationCode.toUpperCase() === cleanCode
          );
          const user = studentProfile
            ? global.__GVK_STORE__.users.find((u) => u.id === studentProfile.id)
            : global.__GVK_STORE__.users.find((u: any) => u.activationCode && u.activationCode.toUpperCase() === cleanCode);
          if (user) {
            user.status = "active";
            user.passwordHash = newPassword;
            (user as any).isActivated = true;
          }
          if (studentProfile) {
            (studentProfile as any).isActivated = true;
          }
        }
        result = { success: true };
        break;
      }

      case "suspend_user": {
        const { userId, role } = payload;
        if (global.__GVK_STORE__) {
          const u = global.__GVK_STORE__.users.find((user) => user.id === userId);
          if (u) u.status = "suspended";
          if (role === "counselor") {
            const c = global.__GVK_STORE__.counselorProfiles.find((coun) => coun.id === userId);
            if (c) c.isActive = false;
          }
        }
        result = { success: true };
        break;
      }

      case "reactivate_user": {
        const { userId, role } = payload;
        if (global.__GVK_STORE__) {
          const u = global.__GVK_STORE__.users.find((user) => user.id === userId);
          if (u) u.status = "active";
          if (role === "counselor") {
            const c = global.__GVK_STORE__.counselorProfiles.find((coun) => coun.id === userId);
            if (c) c.isActive = true;
          }
        }
        result = { success: true };
        break;
      }

      case "delete_student": {
        const { studentId } = payload;
        if (global.__GVK_STORE__) {
          global.__GVK_STORE__.studentProfiles = global.__GVK_STORE__.studentProfiles.filter((s) => s.id !== studentId);
          global.__GVK_STORE__.users = global.__GVK_STORE__.users.filter((u) => u.id !== studentId);
          global.__GVK_STORE__.applications = global.__GVK_STORE__.applications.filter((a) => a.studentId !== studentId);
          global.__GVK_STORE__.tasks = global.__GVK_STORE__.tasks.filter((t) => t.studentId !== studentId);
          global.__GVK_STORE__.documents = global.__GVK_STORE__.documents.filter((d) => d.studentId !== studentId);
          global.__GVK_STORE__.journeyRecords = global.__GVK_STORE__.journeyRecords.filter((j) => j.studentId !== studentId);
          global.__GVK_STORE__.counselorAssignments = global.__GVK_STORE__.counselorAssignments.filter((ca) => ca.studentId !== studentId);
        }
        result = { success: true };
        break;
      }

      case "delete_counselor": {
        const { counselorId } = payload;
        if (global.__GVK_STORE__) {
          global.__GVK_STORE__.counselorProfiles = global.__GVK_STORE__.counselorProfiles.filter((c) => c.id !== counselorId);
          global.__GVK_STORE__.users = global.__GVK_STORE__.users.filter((u) => u.id !== counselorId);
          global.__GVK_STORE__.counselorAssignments = global.__GVK_STORE__.counselorAssignments.filter((ca) => ca.counselorId !== counselorId);
        }
        result = { success: true };
        break;
      }

      case "assign_counselor": {
        const { studentId, counselorId, tasks } = payload;
        result = await assignCounselorInMongo(studentId, counselorId, tasks);
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unrecognized database action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.warn("API /api/db/action offline notice:", err?.message || err);
    // Graceful offline fallback: return 200 so clients continue on local store without logging 500 network errors
    return NextResponse.json(
      { success: false, offline: true, error: err?.message || "Failed to process database mutation, saved locally" },
      { status: 200 }
    );
  }
}
