import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { UploadPage } from "./pages/UploadPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ReaderPage } from "./pages/ReaderPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<UploadPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/read/:bookId" element={<ReaderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
