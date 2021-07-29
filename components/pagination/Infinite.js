import { useSWRInfinite } from "swr";
import map from "lodash/map";
import LoadingIcon from "components/_other/icons/LoadingIcon";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// import styles from "./Infinite.module.scss";

const Infinite = ({
  totalCount = 0,
  pageCount = 1,
  currentPage = 0,
  perPage = 0,
  handleGetKey,
  handleGetHref,
  render,
  className = "",
  destinationElementId = null,
}) => {
  const {
    data,
    size: actualPage,
    setSize: setActualPage,
    isValidating,
  } = useSWRInfinite(handleGetKey, (url) => fetch(url).then((r) => r.json()), {
    initialSize: 0,
  });

  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (isBrowser) {
    return (
      <>
        {createPortal(
          <>
            {map(data, (page, index) => {
              if (index === 0) {
                return;
              }

              return render(page);
            })}
          </>,
          document.getElementById(destinationElementId)
        )}
        {actualPage < pageCount ? (
          <div className={className}>
            <button
              className="button"
              onClick={(e) => {
                const newPage = actualPage ? actualPage + 1 : 2;
                e.preventDefault;
                setActualPage(newPage);
                handleGetHref(newPage);
              }}
            >
              {isValidating ? (
                <>
                  <LoadingIcon />
                </>
              ) : (
                "Zobraziť ďalšie produkty"
              )}
            </button>
          </div>
        ) : (
          ""
        )}
      </>
    );
  }

  return null;
};

export default Infinite;
