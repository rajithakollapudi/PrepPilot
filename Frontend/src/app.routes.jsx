import { createBrowserRouter } from "react-router"
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import Protected from "./features/auth/components/Protected"
import Landing from "./pages/Landing"
import Home from "./features/interview/pages/Home"
import InterviewResume from "./features/resume/pages/InterviewResume"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/interview-prep",
        element: <Protected><Home /></Protected>
    },
    {
        path: "/interview-resume",
        element: <Protected><InterviewResume /></Protected>
    }
])