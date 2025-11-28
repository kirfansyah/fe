import axios from "axios";
export default axios.create({
  baseURL: "/api/proxy",
  //   baseURL: process.env.NEXT_PUBLIC_API_URL,
});
