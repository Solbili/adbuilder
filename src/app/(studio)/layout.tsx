import { Header } from "@/components/studio/Header";

export default function StudioLayout({ children }: LayoutProps<"/">) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Header />
      {children}
    </div>
  );
}
