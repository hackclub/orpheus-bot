import { controller } from '.'

import sample from "lodash/sample";
import memoize from "lodash/memoize"

import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
)

export const memoryErrorMessage = (err) => sample([
  `I think I'm suffering from amnesia... I'm trying to recall what we were talking about, but all that comes to mind is \`{${err}}\``,
  `Hmmm... something's on the tip of my tongue, but all I can think is \`${err}\``,
  `Do you ever try to remember something, but end up thinking \`${err}\` instead? Wait... what were we talking about?`,
  `Hmmm... I'm having trouble thinking right now. Whenever I focus, \`${err}\` is the only thing that comes to mind`,
  `Aw jeez, this is embarrassing. My database just texted me \`${err}\``,
  `I just opened my notebook to take a note, but it just says \`${err}\` all over the pages`,
])


/**
 * Sanitize a query argumennt for airtable to protect against injection attacks.
 * 
 * @todo Should be further checked to make sure this actually is secure.
 * 
 * @param arg the query argument to sanitize
 */
export const sanitizeQueryArg = (arg: string): string =>
  arg.replace(/[\\"]/g, "\\$&")

class BaseTable<FieldSet extends Airtable.FieldSet> {
  _table: Airtable.Table<FieldSet>

  constructor(readonly tableName: string) {
    this._table = base(tableName) as unknown as Airtable.Table<FieldSet>;

    this.patch = this._table.update.bind(this._table);
    this.create = this._table.create.bind(this._table);
  }

  patch: Airtable.Table<FieldSet>["update"]
  create: Airtable.Table<FieldSet>["create"]

  /**
   * Get all of the records.
   * 
   * @param tableName the name of the AirTable table
   * @example table("Leaders").findAll()
   */
  findAll(): Promise<readonly Airtable.Row<FieldSet>[]>
  /**
   * Look up records by formula.
   * 
   * @param forumla the formula
   * 
   * @example table.findAll('Clubs', '{Slack Channel ID} = BLANK()')
   */
  findAll(formula: string): Promise<readonly Airtable.Row<FieldSet>[]>
  /** 
   * Look up records where `key` is `value`.
   * 
   * @param key the field name to match on
   * @param value 
   * @example table('Clubs').findAll('Slack Channel ID', slackChannelID)
   */
  findAll(key: keyof FieldSet, value: string): Promise<readonly Airtable.Row<FieldSet>[]>
  /** 
   * @private
   */
  findAll(searchArg?: string, tertiaryArg?: string): Promise<readonly Airtable.Row<FieldSet>[]> {
    const filterByFormula =
      searchArg != null &&
        tertiaryArg != null
        ? `{${searchArg}} = "${sanitizeQueryArg(tertiaryArg)}"` // this is a key/value lookup
        : searchArg // this is a formula lookup

    console.log(
      filterByFormula
      ? `I wrote a query & sent it to AirTable: BASE=${this.tableName} FILTER=${filterByFormula}`
      : `I'm asking AirTable to send me ALL records in the "${this.tableName}" base`
    );

    return this._table.select({filterByFormula}).all();
  }

  async findOne(formula: string): Promise<Airtable.Row<FieldSet> | undefined>
  async findOne(key: keyof FieldSet, value: string): Promise<Airtable.Row<FieldSet> | undefined>
  async findOne(...args: [string?, string?]): Promise<Airtable.Row<FieldSet> | undefined> {
    const all = await this.findAll(...args);
    
    return all[0];
  }
}

const __getTable = <T extends Airtable.FieldSet>(tableName: string): BaseTable<T> => {
  return new BaseTable(tableName)
};

export const table: <T extends Airtable.FieldSet>(tableName: string) => BaseTable<T> = memoize(__getTable);

export const getSlackUser = user =>
  new Promise((resolve, reject) => {
    initBot().api.users.info({ user }, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res.user)
    })
  });


interface OrpheusRowFields extends Airtable.FieldSet {
  Data: string
  User: string
}

const orpheus = table<OrpheusRowFields>("Orpheus");

export const buildUserRecord = (record: Airtable.Row<OrpheusRowFields>) => {
  const fields = JSON.parse(record.fields.Data || '{}');
  
  return {
    ...record,
    fields,
    async patch(patch) {
      const newFields = {
        Data: JSON.stringify({ ...fields, ...patch }, null, 2),
      }
      const newRecord = await orpheus.patch(record.id, newFields);
  
      return buildUserRecord(newRecord);
    }
  };
}

export const userRecord = async (userId: string) => {
  console.log(`*I'm upserting an airRecord for "${userId}"*`)

  const record = (await orpheus.findOne('User', userId)) || (await orpheus.create({
    User: userId,
    Data: "{}"
  }))[0];

  return buildUserRecord(record);
};

export const initBot = (admin = false) =>
  // we need to create our "bot" context for interactions that aren't initiated by the user.
  // ex. we want to send a "hello world" message on startup w/o waiting for a user to trigger it.

  // (max@maxwofford.com) Warning about admin tokens: this runs with my
  // workspace token. Whatever is done with this token will look like I did it
  // (ex. "@msw has renamed this channel")
  controller.spawn({
    token: admin ? process.env.SLACK_LEGACY_TOKEN : process.env.SLACK_BOT_TOKEN,
  })
