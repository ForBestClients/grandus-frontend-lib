import { LoadingOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { first, get, isEmpty, map, slice } from "lodash";
import Link from "next/link";

import Form from "antd/lib/form/Form";
import { useRouter } from "next/router";

import styles from "./Search.module.scss";
import TopProduct from "./autocomplete/TopProduct";
import ProductRow from "./autocomplete/ProductRow";

const Results = ({ products, brands, categories, closeAction }) => {
  const topProduct = first(products);
  const otherProducts = slice(products, 1, -1);
  return (
    <div className={styles?.results}>
      <div className={styles?.resultsWrapper}>
        <span
          className={styles?.close}
          onClick={() => {
            closeAction(true);
          }}
        >
          <CloseCircleOutlined />
        </span>
        <section className={styles?.resultsLeft}>
          {/* <h2>Značky</h2>
          <ul className={styles?.inline}>
            {map(brands, (brand) => (
              <li key={`autosuggest-brand-${brand?.urlName}`}>
                <a className={styles?.tag} href="#">
                  {brand?.name}
                </a>
              </li>
            ))}
          </ul> */}

          <h2>Kategórie</h2>
          {!isEmpty(categories) ? (
            <ul>
              {map(categories, (category) => (
                <li key={`autosuggest-category-${category?.urlName}`}>
                  <Link
                    href="/kategoria/[category]/[[...parameters]]"
                    as={`/kategoria/${category?.urlName}`}
                  >
                    <a
                      onClick={() => {
                        closeAction(false);
                      }}
                    >
                      {category?.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Ľutujeme, hľadanému výrazu nezodpovedá žiadna kategória</p>
          )}
        </section>
        {!isEmpty(products) ? (
          <>
            <section className={styles?.topProduct}>
              <h2>Top produkt</h2>
              <TopProduct {...topProduct} closeAction={closeAction} />
            </section>
            <section className={styles?.resultsRight}>
              <h2>Produkty</h2>
              {map(otherProducts, (product) => (
                <ProductRow
                  key={`autosuggest-product-${product?.id}`}
                  {...product}
                  closeAction={closeAction}
                />
              ))}
            </section>
          </>
        ) : (
          <section className={styles?.emptyProducts}>
            <h2>Produkty</h2>
            <p>
              Ľutujeme, hľadanému výrazu nezodpovedajú žiadne produkty z našej
              ponuky
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

const Search = ({ endpoint = "/api/lib/v1/autosuggest?search=" }) => {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const [typing, setTyping] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [typingTimeout, setTypingTimeout] = React.useState(0);
  const [results, setResults] = React.useState([]);

  const wrapperRef = React.useRef(null);

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, isFocused]);

  const fetchResults = async (value) => {
    setLoading(true);
    const data = await fetch(`${endpoint}${value}`).then((result) =>
      result.json()
    );
    setResults(data);
    setLoading(false);
  };

  const handleClose = (clearValue = true) => {
    if (clearValue) {
      setValue("");
    }
    setResults([]);
    setLoading(false);
    setIsFocused(false);
  };

  const handleChange = (e) => {
    const value = get(e, "target.value", "");
    setIsFocused(true);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    setValue(value);
    setTyping(true);
    setTypingTimeout(
      setTimeout(() => {
        setTyping(false);
        fetchResults(value);
      }, 1000)
    );
  };

  const handleFocus = (e) => {
    const value = get(e, "target.value", "");
    setIsFocused(true);

    if (value) {
      setValue(value);
      fetchResults(value);
    }
  };

  const handleSubmit = () => {
    handleClose();
    if (value.length) {
      router.push({
        pathname: "/vyhladavanie/[term]/[[...parameters]]",
        query: { term: value },
      });
    }
  };

  const handleClickOutside = (e) => {
    if (
      isFocused &&
      wrapperRef.current &&
      !wrapperRef.current.contains(e.target)
    ) {
      handleClose(true);
    }
  };

  return (
    <div className={styles["search"]} ref={wrapperRef}>
      <Form onFinish={handleSubmit}>
        <input
          onChange={handleChange}
          onFocus={handleFocus}
          name="term"
          type="text"
          value={value}
        />
        <button type="submit">
          <div
            style={{
              width: "20px",
              height: "20px",
              display: "inline-block",
            }}
          >
            {typing || loading ? (
              <LoadingOutlined spin />
            ) : (
              <svg
                height={20}
                width={20}
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>search</title>
                <g>
                  <path d="M27.166 27.461c.388-.177.59-.446.666-.817v-.033l.008-.034v-.202a.775.775 0 0 1-.042-.143c-.025-.076-.042-.135-.06-.177a1.109 1.109 0 0 0-.285-.337l-2.518-2.206c-.842-.741-1.684-1.466-2.501-2.198-.085-.076-.21-.177-.236-.37-.009-.186.11-.304.194-.397a9.785 9.785 0 0 0 2.332-3.84 9.205 9.205 0 0 0 .388-3.79c-.203-1.944-.96-3.696-2.24-5.203-1.44-1.685-3.293-2.83-5.508-3.41a9.86 9.86 0 0 0-2.088-.312L13.735 4c-1.634.135-3.15.59-4.514 1.381-2.139 1.221-3.655 2.947-4.53 5.12a8.849 8.849 0 0 0-.607 2.779v.025c-.008.657-.008 1.162.034 1.348v.008c.236 1.903.834 3.495 1.836 4.842 1.355 1.81 3.174 3.082 5.431 3.79 1.255.387 2.594.547 3.941.454 1.6-.11 3.116-.539 4.514-1.296.236-.127.463-.11.665.075.876.767 1.769 1.55 2.62 2.308.858.758 1.76 1.532 2.643 2.299.278.244.489.362.733.404.025 0 .042.008.067.008h.245c.025-.008.05-.008.084-.017a.964.964 0 0 0 .27-.067zm-10.922-5.945c-.59.11-1.179.168-1.751.168-2.013 0-3.832-.673-5.44-2.03A7.368 7.368 0 0 1 6.5 15.428c-.396-1.903-.11-3.713.901-5.372 1.12-1.878 2.804-3.116 4.985-3.722a8.438 8.438 0 0 1 3.369-.21c1.793.243 3.36.984 4.657 2.205a7.68 7.68 0 0 1 2.282 4c.11.472.16.952.16 1.449-.009 2.114-.767 3.95-2.257 5.431a8.093 8.093 0 0 1-4.354 2.308z" />
                </g>
              </svg>
            )}
          </div>
        </button>
      </Form>
      {!isEmpty(results) ? (
        <Results {...results} closeAction={handleClose} />
      ) : null}
    </div>
  );
};

export default Search;
