import axios from "axios";


const api = axios.create({
  baseURL: "http://10.0.2.2:3000", // for android.
  headers: {
    "Content-Type": "application/json"
  }
})

export default async function apiRequest(requestType: string, data: any, url: string) {
  try {
    const response = await api.request({
      method: requestType,
      url: url,
      data: data
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.log("API Error:", error);
    return {
      success: false,
      error: error
    };
  }
}
