import { table, sanitizeQueryArg } from "../utils";
import { FieldSet } from "airtable";
import { Leader, LeaderKeys } from "./leaders";

export enum ClubKeys {
  id = "ID"
}

export interface Club extends FieldSet {
  [ClubKeys.id]: string
}


export const clubs = table<Club>("Club");

export const getClubByLeader = async (leader: Leader) =>
  clubs.findOne(`FIND("${sanitizeQueryArg(leader[LeaderKeys.id])}", Leaders)`)

export default clubs;