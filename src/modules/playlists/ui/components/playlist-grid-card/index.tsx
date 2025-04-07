import { PlaylistGetManyOutput } from "@/modules/playlists/type";
import Link from "next/link";
import { PlaylistThumbnail } from "./playlist-thumbnail";
import { PlaylistInfo } from "./playlist-info";

interface PlaylistGridCardProps {
  data: PlaylistGetManyOutput["items"][number];
}

export const PlayListGridCard = ({ data }: PlaylistGridCardProps) => {
  return (
    <Link href={`/playlists/${data.id}`}>
      <div className="flex flex-col gap-2 w-full group">
        <PlaylistThumbnail
          imageUrl={data.thumbnailUrl || "images/placeholder.svg"}
          title={data.name}
          videoCount={data.videoCount}
        />
        <PlaylistInfo data={data}/>
      </div>
    </Link>
  );
};
