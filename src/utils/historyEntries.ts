import { table } from "../utils";
import { FieldSet } from "airtable";
import { Club, ClubKeys } from "./clubs";

export enum HistoryEntryKeys {
  date = "Date",
  attendance = "Attendance"
}

export interface HistoryEntry extends FieldSet {
  [HistoryEntryKeys.date]: string;
}

export const historyEntries = table<HistoryEntry>("History");
export default historyEntries;

export const getClubHistory = async (club: Club, timezone: string) => {
  const records = await historyEntries.findAll("Club", club[ClubKeys.id]);

  const meetings = records
    .filter(h => h.fields[HistoryEntryKeys.attendance])
    .sort(
      (a, b) =>
        Date.parse(a.fields[HistoryEntryKeys.date]) -
        Date.parse(b.fields[HistoryEntryKeys.date])
    );

  return {
    lastMeetingDay:
      meetings.length > 0
        ? new Date(
            meetings[0].fields[HistoryEntryKeys.date]
          ).toLocaleDateString("en-us", {
            weekday: "long",
            timeZone: timezone
          })
        : "monday",
    records,
    meetings
  };
};

export const recordMeeting = (clubId: string, meeting: {
  date,
  attendance
}) => {
  console.log("Recording meeting:", clubId, meeting)
  return historyEntries.create({
    Type: ['Meeting'],
    Club: [clubId],
    Date: meeting.date,
    Attendance: meeting.attendance,
    Notes: `@orpheus-bot created this entry from a Slack checkin`,
  })
}