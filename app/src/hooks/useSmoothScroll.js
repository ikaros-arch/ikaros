import { useEffect } from 'react';

const useSmoothScroll = () => {
  useEffect(() => {
    const handleScroll = (event) => {
      const target = event.target;
      const delta = Math.sign(event.deltaY);

      if (target.classList.contains('fill-most') && delta > 0 && target.scrollTop + target.clientHeight >= target.scrollHeight) {
        event.preventDefault();
        const outer = target.closest('.fill-most');
        if (outer) {
          outer.scrollTop += delta * 30; // Adjust the scroll speed as needed
        }
      } else if (target.classList.contains('fill-most') && delta < 0 && target.scrollTop <= 0) {
        event.preventDefault();
        const outer = target.closest('.fill-most');
        if (outer) {
          outer.scrollTop += delta * 30; // Adjust the scroll speed as needed
        }
      }
    };

    const innerElements = document.querySelectorAll('.fill-most .fill-most');
    innerElements.forEach(inner => {
      inner.addEventListener('wheel', handleScroll);
    });

    return () => {
      innerElements.forEach(inner => {
        inner.removeEventListener('wheel', handleScroll);
      });
    };
  }, []);
};

export default useSmoothScroll;