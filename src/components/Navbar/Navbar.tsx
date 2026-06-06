import { getCollectionsByHandles, getNavCollectionHandles, Collection } from "@/lib/shopify";
import NavClient from "./NavClient";

export default async function Navbar() {
  const handles = getNavCollectionHandles();
  let collections: Collection[] = [];
  if (handles.length > 0) {
    try {
      collections = await getCollectionsByHandles(handles);
    } catch (e) {
      console.error("Navbar: failed to fetch collections", e);
    }
  }

  return <NavClient collections={collections} />;
}
