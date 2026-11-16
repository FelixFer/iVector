import { relatedRecords, type RecordSnapshot } from "@/data/records";
import styles from "./related-records.module.css";

export function RelatedRecords({ content, id }: { content: RecordSnapshot; id: string }) {
  const groups = relatedRecords(content, id);
  if (!groups.length) return null;
  return <div className={styles.related}>{groups.map(({ label, records }) => <div key={label}>
    <p>{label}</p>
    <ul>{records.map(record => <li key={record.id}><a href={record.href}>{record.label}</a></li>)}</ul>
  </div>)}</div>;
}
