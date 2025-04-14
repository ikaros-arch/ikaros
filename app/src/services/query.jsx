import axios from "axios";
import { useStore } from 'services/store';

export async function makeRequest(method, table, data = {}, headers = {}) {
  const apiEndpoint = useStore.getState().env.apiEndpoint;
  const url = apiEndpoint + table;

  try {
    const response = await axios({
      method: method, 
      url: url, 
      data: data, 
      headers: headers
    });

    console.log(response.status + " " + response.statusText + ": " + url);
    // Process your response here
    return response.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
    // Handle error here
  }
}

export async function externalRequest(method, url, data = {}, headers = {}) {
  
  try {
    const response = await axios({
      method: method, 
      url: url, 
      data: data, 
      headers: headers
    });

    console.log(response.status + " " + response.statusText + ": " + url);
    // Process your response here
    return response.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
    // Handle error here
  }
}