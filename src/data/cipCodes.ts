// CIP (Classification of Instructional Programs) 4-digit codes that map each
// pathway track to the specific majors most relevant for it.
// Reference: https://nces.ed.gov/ipeds/cipcode/
//
// We pass these to the College Scorecard API as
//   latest.programs.cip_4_digit.code=<csv>
// so the colleges shown for each career actually offer programs in that field.
// Scorecard has no 2-digit filter — only 4-digit — so each track lists the
// handful of 4-digit codes that best characterize it.

import type { PathwayTrack } from "./pathway";

const TRACK_CIP: Record<PathwayTrack, string[]> = {
  Technology: [
    "1107", // Computer Science
    "1108", // Computer Software & Media Applications
    "1109", // Computer Systems Networking
    "1410", // Electrical & Electronics Engineering
    "1409", // Computer Engineering
    "1419", // Mechanical Engineering
    "1408", // Civil Engineering
  ],
  Healthcare: [
    "5138", // Registered Nursing
    "5112", // Medicine (pre-med)
    "5120", // Pharmacy
    "5108", // Allied Health & Medical Assisting
    "5113", // Medical Clinical Sciences
    "5102", // Communication Disorders
  ],
  Business: [
    "5201", // Business / Commerce, General
    "5202", // Business Administration & Management
    "5203", // Accounting
    "5208", // Finance
    "5214", // Marketing
  ],
  Creative: [
    "5004", // Design & Applied Arts
    "5006", // Film / Video / Photographic Arts
    "5007", // Fine & Studio Arts
    "5009", // Music
    "0904", // Journalism
    "0907", // Radio, TV & Digital Communication
  ],
  Science: [
    "2601", // Biology, General
    "2701", // Mathematics
    "4005", // Chemistry
    "4008", // Physics
    "4006", // Geological & Earth Sciences
  ],
  Education: [
    "1301", // Education, General
    "1312", // Teacher Ed — Specific Subject Areas
    "1313", // Teacher Ed — Programs
    "1310", // Special Education
  ],
  General: [],
};

export function trackToCipCodes(track: PathwayTrack): string[] {
  return TRACK_CIP[track] ?? [];
}
