import { formatTimeAgo } from "@/lib/dateformat";

export default function TimeAgo({ date }: { date: Date | number }) {
  return <span>{formatTimeAgo(date)}</span>;
}