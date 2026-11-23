'use strict';

const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

function selectTab(index, focus) {
  for (const [position, tab] of tabs.entries()) {
    const active = position === index;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    if (active && focus) tab.focus();
  }
}

for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectTab(index, false));
  tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = tabs.length - 1;
    else if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
    else return;
    event.preventDefault();
    selectTab(target, true);
  });
}
