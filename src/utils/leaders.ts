import { table } from "../utils";
import { FieldSet } from "airtable";

export enum LeaderKeys {
  slackId = "Slack ID",
  id = "ID"
}

export interface Leader extends FieldSet {
  [LeaderKeys.slackId]: string
  [LeaderKeys.id]: string
}

export const leaders = table<Leader>("Leaders");

export const getLeaderBySlackUserId = async (slackUserId: string) =>
  leaders.findOne(LeaderKeys.slackId, slackUserId);
