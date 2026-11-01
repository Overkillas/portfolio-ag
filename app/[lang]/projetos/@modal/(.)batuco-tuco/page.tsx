import { InterceptedProject } from "@/components/projects/InterceptedProject";

export default function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return <InterceptedProject params={params} slug="batuco-tuco" />;
}
