import MapLoader from "@/components/MapLoader";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-6 py-10">
      <h1 className="mb-6 text-xl font-medium">行きたいマップ</h1>
      <MapLoader />
    </main>
  );
}
