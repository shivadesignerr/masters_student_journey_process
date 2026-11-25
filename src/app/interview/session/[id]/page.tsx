"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { dataStore } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { GvkLogo } from "@/components/shared/GvkLogo";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ExternalLink,
  ShieldCheck,
  Clock,
  User,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

const interviewQuestions = [
  {
    category: "Academic Motivation",
    question: "Introduce your academic background and explain why you chose this specific Masters programme over other universities.",
    guidance: "Highlight your undergraduate projects, GPA credibility, and academic trajectory.",
  },
  {
    category: "Course & Curriculum Fit",
    question: "Which specific core or elective modules in the course syllabus most align with your future research or career specialisation?",
    guidance: "Name 2-3 specific modules, laboratory facilities, or faculty publications.",
  },
  {
    category: "Post-Study Career Goals",
    question: "What is your immediate post-study plan upon completing your Masters? How does this degree enhance your value in the Indian industry?",
    guidance: "Focus on long-term career prospects in India, targeted job roles, and industrial sectors.",
  },
  {
    category: "Financial & Credibility Scrutiny",
    question: "Explain how your tuition fees and UK living expenses will be funded. Have your bank loan and financial documents been verified?",
    guidance: "Mention sanctioned education loan provider (e.g. HDFC Credila), 28-day holding, and parent co-borrower sponsorship.",
  },
];

export default function InterviewSessionStudioPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = (params?.id as string) || "mock-01";

  const allInterviews = dataStore.getAllMockInterviews();
  const interview = allInterviews.find((i) => i.id === interviewId) || allInterviews[0];

  const student = interview?.studentId
    ? dataStore.getStudentProfile(interview.studentId)
    : dataStore.getStudentProfile("usr-student-01");
  const counselor = interview?.counselorId
    ? dataStore.getCounselorProfile(interview.counselorId)
    : dataStore.getCounselorProfile("usr-counselor-01");

  // Media streams
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Studio timer
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Counselor evaluation state
  const [outcome, setOutcome] = useState<"PASS" | "FAIL">("PASS");
  const [scoreComm, setScoreComm] = useState(4);
  const [scoreAcad, setScoreAcad] = useState(4);
  const [scoreVisa, setScoreVisa] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState("Demonstrated clear articulation of course curriculum and post-study career orientation.");
  const [evalSubmitted, setEvalSubmitted] = useState(false);

  // Request webcam on mount
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          activeStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setStream(activeStream);
          if (videoRef.current) {
            videoRef.current.srcObject = activeStream;
          }
        }
      } catch (err: any) {
        console.warn("Camera/microphone not accessible:", err.message);
        setCameraError("Webcam/Microphone preview in simulated studio mode.");
      }
    }
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !isVideoOn));
    }
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !isAudioOn));
    }
    setIsAudioOn(!isAudioOn);
  };

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interview) return;

    const counselorId = interview.counselorId || "usr-counselor-01";
    dataStore.evaluateMockInterview(
      interview.id,
      counselorId,
      outcome,
      "Strong motivation and articulate spoken clarity.",
      "Expand on detailed course modules.",
      scoreComm,
      scoreAcad,
      scoreVisa,
      feedbackNotes,
      "Evaluated live inside GVK Video Studio."
    );
    setEvalSubmitted(true);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-gvk-red selection:text-white">
      {/* Top Studio Control Bar */}
      <header className="h-16 px-4 md:px-8 border-b border-white/10 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <GvkLogo variant="light" href="/" />
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
              Live Admissions Studio
            </span>
          </div>
        </div>

        {/* Center Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 font-mono text-sm font-bold text-amber-400 shadow-inner">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{timeFormatted} Remaining</span>
        </div>

        {/* Launch Zoom Option */}
        <div className="flex items-center gap-2">
          <a
            href={interview?.zoomMeetingUrl || "https://zoom.us/test"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-xs"
            title="Open verified Zoom cloud meeting"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Launch Zoom App</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5 text-gvk-red" />
            <span>Exit Studio</span>
          </button>
        </div>
      </header>

      {/* Main Studio Arena */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl w-full mx-auto">
        {/* Left 2 Columns: Video Feeds */}
        <div className="lg:col-span-2 flex flex-col justify-between gap-4">
          {/* Main Video Screen */}
          <div className="relative aspect-video bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Live Camera View */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover mirror ${!isVideoOn ? "hidden" : ""}`}
            />

            {/* Video Off Fallback Avatar */}
            {!isVideoOn && (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-xl">
                  {student?.firstName?.charAt(0) || "R"}
                </div>
                <span className="text-xs font-semibold">Camera is turned off</span>
              </div>
            )}

            {/* In-Video Watermark & Name Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{student ? `${student.firstName} ${student.lastName}` : "Rahul Sharma"} (Candidate)</span>
            </div>

            {/* Interviewer Inset Pip */}
            <div className="absolute bottom-4 right-4 w-40 sm:w-48 aspect-video bg-slate-800 rounded-xl border border-white/20 shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center p-2">
              <div className="w-8 h-8 rounded-full bg-gvk-navy text-white flex items-center justify-center font-bold text-xs mb-1">
                {counselor?.firstName?.charAt(0) || "P"}
              </div>
              <span className="text-[11px] font-bold truncate max-w-[140px] text-white">
                {counselor ? `${counselor.firstName} ${counselor.lastName}` : "Priya Varma"}
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">GVK Lead Evaluator</span>
            </div>

            {/* Verified Zoom Credentials Ribbon */}
            <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300">
              <span>Zoom ID: <strong>{interview?.zoomMeetingId || "984 9012 3456"}</strong></span>
              <span>•</span>
              <span>Passcode: <strong>{interview?.zoomPasscode || "GVK2026"}</strong></span>
            </div>
          </div>

          {/* Video Control Bar */}
          <div className="bg-slate-900/90 rounded-2xl border border-white/10 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors ${
                  isAudioOn
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isAudioOn ? "Mute" : "Unmuted"}</span>
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors ${
                  isVideoOn
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isVideoOn ? "Stop Video" : "Start Video"}</span>
              </button>
            </div>

            {/* Verified Cloud Meeting Link */}
            <a
              href={interview?.zoomMeetingUrl || "https://zoom.us/start/videomeeting"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition-all shadow-md"
            >
              <Video className="w-4 h-4" />
              <span>Connect with Zoom Web/App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => router.back()}
              className="p-3 px-4 rounded-xl font-bold text-xs bg-red-600/90 hover:bg-red-600 text-white flex items-center gap-1.5 transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              <span className="hidden sm:inline">End Call</span>
            </button>
          </div>
        </div>

        {/* Right 1 Column: Structured Interview Questions & Counselor Evaluation */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Active Question Prompter */}
          <div className="bg-slate-900 rounded-2xl border border-white/10 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {interviewQuestions[currentQuestionIdx].category}
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">
                Q {currentQuestionIdx + 1} of {interviewQuestions.length}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white leading-snug">
              &ldquo;{interviewQuestions[currentQuestionIdx].question}&rdquo;
            </h3>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300">
              <strong className="text-amber-400 block mb-0.5 font-bold">Evaluation Focus:</strong>
              {interviewQuestions[currentQuestionIdx].guidance}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                className="p-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                disabled={currentQuestionIdx === interviewQuestions.length - 1}
                onClick={() => setCurrentQuestionIdx((p) => Math.min(interviewQuestions.length - 1, p + 1))}
                className="p-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Counselor Evaluation Rubric */}
          <div className="bg-slate-900 rounded-2xl border border-white/10 p-5 shadow-xl space-y-3.5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Readiness Rubric</span>
                </h4>
                {evalSubmitted && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Recorded</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleEvaluate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Assessment Result</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOutcome("PASS")}
                      className={`py-2 rounded-lg font-black transition-all ${
                        outcome === "PASS"
                          ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400"
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      PASS (Ready)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutcome("FAIL")}
                      className={`py-2 rounded-lg font-black transition-all ${
                        outcome === "FAIL"
                          ? "bg-red-600 text-white shadow-md ring-2 ring-red-400"
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      FAIL (Retake)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Comm (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={scoreComm}
                      onChange={(e) => setScoreComm(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded bg-white/10 border border-white/10 text-center font-bold text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Acad (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={scoreAcad}
                      onChange={(e) => setScoreAcad(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded bg-white/10 border border-white/10 text-center font-bold text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Visa (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={scoreVisa}
                      onChange={(e) => setScoreVisa(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded bg-white/10 border border-white/10 text-center font-bold text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Feedback for Student</label>
                  <textarea
                    rows={2}
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white/10 border border-white/10 text-xs text-white"
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="w-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Save Evaluation & Complete Session
                </Button>
              </form>
            </div>

            <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 text-center">
              Candidate: <strong>{student ? `${student.firstName} ${student.lastName}` : "Rahul Sharma"}</strong> • {student?.targetDegree}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
