export type PathwayCategory = "courses" | "activities" | "volunteer" | "skills";

export type GradePlan = {
  gradeValue: string;
  label: string;
  courses: string[];
  activities: string[];
  volunteer: string[];
  skills: string[];
};

export type PathwayTrack =
  | "Technology"
  | "Healthcare"
  | "Business"
  | "Creative"
  | "Science"
  | "Education"
  | "General";

export function itemId(gradeValue: string, category: PathwayCategory, title: string): string {
  return `${gradeValue}:${category}:${title}`;
}
