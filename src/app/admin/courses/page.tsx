"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import { UniversityBadge } from "@/components/shared/UniversityLogo";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Building2,
  Briefcase,
  Award,
  Edit,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";

export default function CourseManagementPage() {
  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [disciplineFilter, setDisciplineFilter] = useState("all");
  const [placementFilter, setPlacementFilter] = useState("all");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    universityName: "",
    courseName: "",
    degreeLevel: "Postgraduate (MSc)",
    discipline: "Computer Science & IT",
    intake: "September Intake",
    durationYears: 1,
    tuitionFee: 28000,
    tuitionFeeCurrency: "GBP",
    placementAvailable: true,
    placementStructure: "1-Year Industrial Placement Track",
    minIeltsScore: 6.5,
    minCgpa: 6.5,
    scholarshipAvailable: true,
    scholarshipDetails: "GVK Partner Merit Award: Up to £4,000 tuition fee waiver",
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const courses = dataStore.getAllCourses();
  const universities = dataStore.getAllUniversities();

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const disciplines = useMemo(() => {
    const set = new Set(courses.map((c) => c.discipline || "General"));
    return Array.from(set).sort();
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.discipline && c.discipline.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchUni = universityFilter === "all" || c.universityName === universityFilter;
      const matchDisc = disciplineFilter === "all" || c.discipline === disciplineFilter;
      const matchPlacement =
        placementFilter === "all" ||
        (placementFilter === "yes" && c.placementAvailable) ||
        (placementFilter === "no" && !c.placementAvailable);
      return matchSearch && matchUni && matchDisc && matchPlacement;
    });
  }, [courses, searchQuery, universityFilter, disciplineFilter, placementFilter]);

  const handleOpenAdd = () => {
    setFormData({
      universityName: universities[0]?.name || "University of Manchester",
      courseName: "",
      degreeLevel: "Postgraduate (MSc)",
      discipline: "Computer Science & IT",
      intake: "September Intake",
      durationYears: 1,
      tuitionFee: 28000,
      tuitionFeeCurrency: "GBP",
      placementAvailable: true,
      placementStructure: "1-Year Industrial Placement Track",
      minIeltsScore: 6.5,
      minCgpa: 6.5,
      scholarshipAvailable: true,
      scholarshipDetails: "GVK Partner Merit Award: Up to £4,000 tuition fee waiver",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (course: any) => {
    setEditingId(course.id);
    setFormData({
      universityName: course.universityName,
      courseName: course.courseName,
      degreeLevel: course.degreeLevel || "Postgraduate (MSc)",
      discipline: course.discipline || "Computer Science & IT",
      intake: course.intake || "September Intake",
      durationYears: course.durationYears || 1,
      tuitionFee: course.tuitionFee || 28000,
      tuitionFeeCurrency: course.tuitionFeeCurrency || "GBP",
      placementAvailable: !!course.placementAvailable,
      placementStructure: course.placementStructure || "",
      minIeltsScore: course.minIeltsScore || 6.5,
      minCgpa: course.minCgpa || 6.5,
      scholarshipAvailable: !!course.scholarshipAvailable,
      scholarshipDetails: course.scholarshipDetails || "",
    });
    setIsEditOpen(true);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.addCourse({
      universityName: formData.universityName,
      courseName: formData.courseName,
      degreeLevel: formData.degreeLevel,
      discipline: formData.discipline,
      intake: formData.intake,
      durationYears: formData.durationYears as 1 | 2,
      tuitionFee: Number(formData.tuitionFee),
      tuitionFeeCurrency: formData.tuitionFeeCurrency,
      placementAvailable: formData.placementAvailable,
      placementStructure: formData.placementStructure,
      minIeltsScore: Number(formData.minIeltsScore),
      minCgpa: Number(formData.minCgpa),
      scholarshipAvailable: formData.scholarshipAvailable,
      scholarshipDetails: formData.scholarshipDetails,
    });
    setIsAddOpen(false);
    showToast(`Added ${formData.courseName} at ${formData.universityName}.`);
  };

  const handleUpdateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    dataStore.updateCourse(editingId, {
      universityName: formData.universityName,
      courseName: formData.courseName,
      degreeLevel: formData.degreeLevel,
      discipline: formData.discipline,
      intake: formData.intake,
      durationYears: formData.durationYears as 1 | 2,
      tuitionFee: Number(formData.tuitionFee),
      tuitionFeeCurrency: formData.tuitionFeeCurrency,
      placementAvailable: formData.placementAvailable,
      placementStructure: formData.placementStructure,
      minIeltsScore: Number(formData.minIeltsScore),
      minCgpa: Number(formData.minCgpa),
      scholarshipAvailable: formData.scholarshipAvailable,
      scholarshipDetails: formData.scholarshipDetails,
    });
    setIsEditOpen(false);
    showToast(`Updated course details for ${formData.courseName}.`);
  };

  const avgFee = useMemo(() => {
    if (courses.length === 0) return 0;
    const total = courses.reduce((acc, c) => acc + (c.tuitionFee || 0), 0);
    return Math.round(total / courses.length);
  }, [courses]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Academic Course Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curated postgraduate programs, placement opportunities, tuition fees, and scholarship criteria.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Course Program
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Courses
            </span>
            <BookOpen className="w-4 h-4 text-[#253775]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{courses.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Active Master's programs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Industry Placement
            </span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">
            {courses.filter((c) => c.placementAvailable).length}
          </div>
          <p className="text-[11px] text-blue-600 mt-1">Programs with 1-yr work placement</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Scholarships
            </span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">
            {courses.filter((c) => c.scholarshipAvailable).length}
          </div>
          <p className="text-[11px] text-amber-600 mt-1">Eligible for GVK / university grants</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Tuition Fee
            </span>
            <GraduationCap className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            £{avgFee.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Mean annual tuition benchmark</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course title, university, or discipline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#253775]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={universityFilter}
            onChange={(e) => setUniversityFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700 max-w-[200px]"
          >
            <option value="all">All Universities ({universities.length})</option>
            {universities.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">All Disciplines</option>
            {disciplines.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700"
          >
            <option value="all">Placement Track: Any</option>
            <option value="yes">With Placement</option>
            <option value="no">Standard (No Placement)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <AdminCard
        title="Curated Master's Courses"
        subtitle={`Showing ${filteredCourses.length} of ${courses.length} academic programs`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Program & University</th>
                <th className="py-3 px-4">Discipline</th>
                <th className="py-3 px-4">Duration & Intake</th>
                <th className="py-3 px-4">Tuition Fee</th>
                <th className="py-3 px-4">Requirements</th>
                <th className="py-3 px-4">Highlights</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No academic courses match the selected search or filters.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.courseName}</div>
                      <div className="text-[11px] text-blue-900 font-semibold flex items-center gap-1.5 mt-1">
                        <UniversityBadge name={c.universityName} size="xs" />
                        <span>{c.universityName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {c.discipline || "General"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{c.durationYears} Year ({c.degreeLevel || "MSc"})</div>
                      <div className="text-[11px] text-slate-400">{c.intake || "September Intake"}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {c.tuitionFeeCurrency === "GBP" ? "£" : "$"}
                      {c.tuitionFee?.toLocaleString() || "28,000"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>IELTS: <span className="font-semibold">{c.minIeltsScore || 6.5}</span></div>
                      <div className="text-[11px] text-slate-400">Min CGPA: {c.minCgpa || 6.5}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.placementAvailable && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Placement
                          </span>
                        )}
                        {c.scholarshipAvailable && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Scholarship
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-500" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* ADD / EDIT COURSE MODAL */}
      <AdminModal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }}
        title={isAddOpen ? "Add Course Program" : "Edit Course Parameters"}
        description="Configure university affiliation, degree type, tuition fee structure, and entry criteria."
      >
        <form onSubmit={isAddOpen ? handleCreateCourse : handleUpdateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Affiliated University
            </label>
            <select
              required
              value={formData.universityName}
              onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
            >
              {universities.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course / Program Title
            </label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              placeholder="e.g. MSc Advanced Computer Science"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discipline / Faculty
              </label>
              <input
                type="text"
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                placeholder="e.g. Computer Science & IT"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Degree Level
              </label>
              <input
                type="text"
                value={formData.degreeLevel}
                onChange={(e) => setFormData({ ...formData, degreeLevel: e.target.value })}
                placeholder="e.g. Postgraduate (MSc)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (Years)
              </label>
              <select
                value={formData.durationYears}
                onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
              >
                <option value={1}>1 Year Full-time</option>
                <option value={2}>2 Years (with placement)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tuition Fee Amount
              </label>
              <input
                type="number"
                value={formData.tuitionFee}
                onChange={(e) => setFormData({ ...formData, tuitionFee: Number(e.target.value) })}
                placeholder="28000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
              <select
                value={formData.tuitionFeeCurrency}
                onChange={(e) => setFormData({ ...formData, tuitionFeeCurrency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white text-slate-800"
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min IELTS Score
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.minIeltsScore}
                onChange={(e) => setFormData({ ...formData, minIeltsScore: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min CGPA / Grade
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.minCgpa}
                onChange={(e) => setFormData({ ...formData, minCgpa: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="placementAvailable"
                checked={formData.placementAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, placementAvailable: e.target.checked })
                }
                className="w-4 h-4 text-[#253775] rounded border-slate-300"
              />
              <label htmlFor="placementAvailable" className="text-xs font-medium text-slate-700">
                Industry Placement Year Track Available
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="scholarshipAvailable"
                checked={formData.scholarshipAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, scholarshipAvailable: e.target.checked })
                }
                className="w-4 h-4 text-[#253775] rounded border-slate-300"
              />
              <label htmlFor="scholarshipAvailable" className="text-xs font-medium text-slate-700">
                GVK Partner Merit / University Scholarship Available
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
              }}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e]"
            >
              {isAddOpen ? "Add Course Program" : "Save Changes"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
