import styles from './Content.module.scss';

const Content = ({ content, css, js, className }) => {
  return (
    <>
      {css ? (
        <style
          dangerouslySetInnerHTML={{
            __html: css,
          }}
        />
      ) : null}
      {content ? (
        <section
          className={`${styles.wrapper} ${className ? className : ''}`}
          dangerouslySetInnerHTML={{
            __html: content,
          }}
        />
      ) : (
        ''
      )}
      {js ? (
        <div
          dangerouslySetInnerHTML={{
            __html: js,
          }}
        />
      ) : null}
    </>
  );
};

export default Content;
