/** @typedef {{completed: string[], scores: Record<string, number>, lastLesson: string | null}} Progress */
export const STORAGE_KEY = 'dl-quest.progress.v1';
/** @returns {Progress} */
export const emptyProgress = () => ({ completed: [], scores: {}, lastLesson: null });
const partCounts = [6,5,6,6,7,6,4,5,4,3,4,3,3];
const isLesson = id => {
  if(typeof id !== 'string' || !/^(?:[1-9]|1[0-3])-[1-9]$/.test(id)) return false;
  const [chapter,part]=id.split('-').map(Number); return part<=partCounts[chapter-1];
};
/** @param {string | null} raw @returns {Progress} */
export function parseProgress(raw) {
  try {
    const data = JSON.parse(raw || 'null');
    if (!data || typeof data !== 'object') return emptyProgress();
    return {
      completed: [...new Set(Array.isArray(data.completed) ? data.completed.filter(isLesson) : [])],
      scores: Object.fromEntries(Object.entries(data.scores || {}).filter(([key,value]) =>
        /^(?:chapter-(?:[1-9]|1[0-3])|lesson-(?:[1-9]|1[0-3])-[1-9])$/.test(key) &&
        typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100)),
      lastLesson: isLesson(data.lastLesson) ? data.lastLesson : null,
    };
  } catch { return emptyProgress(); }
}
export function toggleCompletion(progress, id) {
  if (!isLesson(id)) return progress;
  return { ...progress, completed: progress.completed.includes(id) ? progress.completed.filter(x=>x!==id) : [...progress.completed,id] };
}
export function recordScore(progress, id, score) {
  return { ...progress, scores: { ...progress.scores, [id]: Math.max(progress.scores[id] || 0, score) } };
}
let memory = emptyProgress();
/** @returns {Progress} */
export function readProgress() {
  try { memory = parseProgress(localStorage.getItem(STORAGE_KEY)); } catch { showStorageNotice(); }
  return memory;
}
function showStorageNotice() {
  if (typeof document !== 'undefined') document.querySelector('.storage-notice')?.removeAttribute('hidden');
}
/** @param {Progress} progress */
export function writeProgress(progress) {
  memory = progress;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { showStorageNotice(); }
  if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent('progress-update'));
}
