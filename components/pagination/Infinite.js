import useSWRInfinite from 'swr/infinite';
import map from 'lodash/map';
import toNumber from 'lodash/toNumber';
import LoadingIcon from 'components/_other/icons/LoadingIcon';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';

const Infinite = ({
  totalCount = 0,
  pageCount = 1,
  currentPage = 0,
  perPage = 0,
  handleGetKey,
  handleGetHref,
  render,
  className = '',
  destinationElementId = null,
  loadMoreDescription,
}) => {
  const {
    data,
    size: actualPage,
    setSize: setActualPage,
    isValidating,
  } = useSWRInfinite(handleGetKey, url => fetch(url).then(r => r.json()), {
    initialSize: currentPage > 1 ? currentPage - 1 : 0,
  });

  const router = useRouter();
  const [isBrowser, setIsBrowser] = useState(false);
  const [inUse, setInUse] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    const newPage = toNumber(router?.query?.page) || 1;
    setActualPage(newPage);
  }, [router?.query?.page]);

  if (isBrowser) {
    return (
      <>
        {inUse
          ? createPortal(
              map(data, (page, index) => {
                if (index < currentPage) {
                  return;
                }

                return render(page);
              }),
              document.getElementById(destinationElementId),
            )
          : ''}
        {actualPage < pageCount ? (
          <div className={className}>
            <button
              className="button"
              onClick={e => {
                const newPage = actualPage ? actualPage + 1 : 2;
                e.preventDefault;
                setActualPage(newPage);
                handleGetHref(newPage);
                setInUse(true);
              }}
            >
              {isValidating ? (
                <>
                  <LoadingIcon />
                </>
              ) : (
                (loadMoreDescription ?? 'Zobraziť ďalšie produkty')
              )}
            </button>
          </div>
        ) : (
          ''
        )}
      </>
    );
  }

  return null;
};

export default Infinite;
