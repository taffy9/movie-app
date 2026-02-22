import { Link } from "react-router-dom";

import { MovieCard } from "@/common";
import { useWatchlistContext } from "@/context/watchlistContext";
import { smallMaxWidth, mainHeading } from "@/styles";
import { cn } from "@/utils/helper";

const Watchlist = () => {
  const { watchlist } = useWatchlistContext();

  return (
    <section
      className={cn(smallMaxWidth, "lg:pt-36 sm:pt-[136px] xs:pt-28 pt-24")}
    >
      <h2
        className={cn(
          mainHeading,
          "dark:text-secColor text-black mb-6 max-w-none sm:max-w-none xs:max-w-none"
        )}
      >
        My Watchlist
      </h2>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="dark:text-gray-400 text-gray-600 sm:text-lg text-base font-nunito">
            Your watchlist is empty.
          </p>
          <Link
            to="/movie"
            className="sm:py-2 xs:py-[6px] py-1 sm:px-4 xs:px-3 px-[10.75px] bg-[#ff0000] text-gray-50 rounded-full md:text-[15.25px] sm:text-[14.75px] xs:text-[14px] text-[12.75px] shadow-md hover:-translate-y-1 transition-all duration-300 font-medium font-nunito"
          >
            Browse movies
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap xs:gap-4 gap-[14px] justify-center">
          {watchlist.map((item) => (
            <div
              key={item.id}
              className="flex flex-col xs:gap-4 gap-2 xs:max-w-[170px] max-w-[124px] rounded-lg lg:mb-6 md:mb-5 sm:mb-4 mb-[10px]"
            >
              <MovieCard movie={item} category={item.category} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Watchlist;
