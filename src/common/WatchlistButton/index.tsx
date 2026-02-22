import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { useWatchlistContext } from "@/context/watchlistContext";
import { IWatchlistItem } from "@/types";
import { cn } from "@/utils/helper";

const WatchlistButton = ({
  item,
  className,
}: {
  item: IWatchlistItem;
  className?: string;
}) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } =
    useWatchlistContext();

  const saved = isInWatchlist(item.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
      className={cn(
        "text-white bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition-colors duration-200",
        className
      )}
    >
      {saved ? (
        <BsBookmarkFill className="text-[#ff0000] text-sm" />
      ) : (
        <BsBookmark className="text-sm" />
      )}
    </button>
  );
};

export default WatchlistButton;
