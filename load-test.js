import http from "k6/http";

export const options = {
  vus: 100,      // 100 users พร้อมกัน
  duration: "30s",
};

export default function () {
  http.get("http://localhost:3000");
}