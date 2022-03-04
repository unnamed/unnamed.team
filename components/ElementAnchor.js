export default function ElementAnchor({ href, parentRef, children }) {
  function follow(event) {
    event.preventDefault();
    event.stopPropagation();

    const target = document.querySelector(href);
    if (target) {
      // uses parentRef or html element
      const root = parentRef
        ? parentRef.current
        : document.body.parentElement;
      root.scroll({
        top: target.offsetTop,
        behavior: 'smooth'
      });

      // because I don't know if it works with other selectors
      if (href.startsWith('#')) {
        // change URL hash (# at the end), this makes users have the
        // same scroll position after reloading (because the URL persists)
        history.replaceState(undefined, undefined, href);
      }
    }
  }

  return <a href={href} onClick={follow}>{children}</a>;
}