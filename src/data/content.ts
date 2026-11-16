export type Resource = {
  label: string;
  href: `https://${string}` | `http://${string}`;
};

export type Photo = {
  src: `/${string}` | `https://${string}` | `http://${string}`;
  alt: string;
  width: number;
  height: number;
};

export type ResearchArea = {
  relatedIds?: readonly string[];
  id: string;
  title: string;
  description: string;
  category?: string;
};

export type Project = {
  relatedIds?: readonly string[];
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  year?: number;
  category?: string;
  links?: readonly Resource[];
};

export type Person = {
  relatedIds?: readonly string[];
  id: string;
  name: string;
  role: string;
  studentId?: string;
  email?: string;
  nationality?: string;
  initials?: string;
  interests?: string;
  profile?: Resource;
  photo?: Photo;
};

export type Publication = {
  relatedIds?: readonly string[];
  id: string;
  title: string;
  authors: readonly string[];
  venue: string;
  year: number;
  paper?: Resource;
};

type About = {
  introduction?: string;
  vision?: string;
  mission?: string;
  philosophy?: string;
  environmentPhoto?: Photo;
};

// Add only approved copy and verified records. See docs/CONTENT_GUIDELINES.md.
export const homeIntroduction: { text?: string } = { text: "iVector Lab is based in the Department of Computer Science and Information Engineering at National Dong Hwa University." };
export const about: About = { introduction: "Based in Hualien, Taiwan, iVector Lab is part of National Dong Hwa University’s Department of Computer Science and Information Engineering." };
export const researchAreas: readonly ResearchArea[] = [];
export const projects: readonly Project[] = [];
export const people: readonly Person[] = [
  { id: "yu-chieh-ho", name: "Yu-Chieh Ho", role: "Assistant Professor", profile: { label: "Official profile", href: "https://sys.ndhu.edu.tw/RD/TeacherTreasury/tlist.aspx?tcher=13763" }, initials: "YH" },
  ...[
    ["Felix Ferdinand", "611521418", "Indonesia", "FF"],
    ["李彥龍", "611521207", "Taiwan", "李"],
    ["邱柏誠", "611521212", "Taiwan", "邱"],
    ["Vo Cong Vinh", "611421316", "Vietnam", "VCV"],
  ].map(([name, studentId, nationality, initials]) => ({ id: studentId, name, studentId, nationality, initials, email: studentId + "@gms.ndhu.edu.tw", role: "Master’s Students" })),
];
export const publications: readonly Publication[] = [];
