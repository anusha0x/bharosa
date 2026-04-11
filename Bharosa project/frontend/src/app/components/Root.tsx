import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import { ChatBot } from "./ChatBot";

export function Root() {
  return (
    <>
      <Navbar />
      <Outlet />
      <ChatBot />
    </>
  );
}
