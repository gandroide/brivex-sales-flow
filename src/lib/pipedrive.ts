
import * as pipedrive from 'pipedrive';

// Ensure we are using version 1 of the API
const { Configuration, DealsApi, PersonsApi } = pipedrive.v1;

const apiConfig = new Configuration({
  apiKey: process.env.PIPEDRIVE_API_KEY || 'dummy-key-for-build',
});

export const dealsApi = new DealsApi(apiConfig);
export const personsApi = new PersonsApi(apiConfig);
