/** Format options authored from the live conversation. No answer bank or state writes. */
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const line = (x, label, max) => {
  if (typeof x !== 'string' || !x.trim() || x.length > max || /[\r\n\x00-\x1f\x7f\u2028\u2029]/.test(x)) throw Error(`Invalid ${label}`);
  return x.trim();
};
const escape = value => value.replace(/[\\`*_[\]<>#|]/g, '\\$&');
export function choiceCard({id, header, question, options, multiSelect = false, recommendedId = null, recommendationReason = null}) {
  id = line(id, 'question id', 80);
  if (!/^[a-z][a-z0-9_-]*$/.test(id)) throw Error('Invalid question id');
  header = line(header, 'header', 12);
  question = line(question, 'question', 400);
  if (typeof multiSelect !== 'boolean' || !Array.isArray(options) || options.length < 2 || options.length > 4) throw Error('Use two to four dynamic options and an explicit selection mode');
  const ids = new Set(), labels = new Set();
  const normalized = options.map(item => {
    if (!object(item)) throw Error('Invalid option');
    const optionId = line(item.id, 'option id', 60), label = line(item.label, 'option label', 60);
    if (!/^[a-z][a-z0-9_-]*$/.test(optionId) || ids.has(optionId) || labels.has(label.toLowerCase())) throw Error('Duplicate or invalid option');
    if (/\(recommended\)/i.test(label)) throw Error('Use recommendedId instead of embedding a recommendation label');
    if (/^(other|custom|write my own answer|let me explain)$/i.test(label)) throw Error('Custom input is separate from concrete suggestions');
    ids.add(optionId); labels.add(label.toLowerCase());
    return {id:optionId, label, description:line(item.description, 'description', 240)};
  });
  if (recommendedId !== null && (!ids.has(recommendedId) || !recommendationReason)) throw Error('A recommendation needs a matching option and reason');
  if (recommendationReason !== null) {
    if (recommendedId === null) throw Error('A recommendation reason needs a selected option');
    recommendationReason = line(recommendationReason, 'recommendation reason', 240);
  }
  return {id, header, question, options:normalized, multiSelect, allowCustom:true, recommendedId, recommendationReason};
}
export function renderChoices(input) {
  const card = choiceCard(input);
  const rows = card.options.map((o, i) => `${i + 1}. **${escape(o.label)}${o.id === card.recommendedId ? ' (Recommended)' : ''}**: ${escape(o.description)}`);
  rows.push(`${card.options.length + 1}. **Write my own answer**: Describe a different direction or modify a suggestion.`);
  const action = card.multiSelect ? 'Choose compatible options, combine them, or write your own answer.' : 'Choose a number or label, modify a suggestion, or write your own answer.';
  return [`### GDS | ${escape(card.header)}`, '', escape(card.question), '', ...rows,
    ...(card.recommendationReason ? ['', `**Why:** ${escape(card.recommendationReason)}`] : []), '', action].join('\n');
}
/** Candidate payload only. Check the actual host schema and its built-in Other field. */
export function claudeQuestion(input) {
  const card = choiceCard(input);
  return {questions:[{header:card.header, question:card.question + (card.recommendationReason ? ` Recommendation: ${card.recommendationReason}` : ''),
    multiSelect:card.multiSelect,
    options:card.options.map(o => ({label:o.label + (o.id === card.recommendedId ? ' (Recommended)' : ''), description:o.description}))}]};
}
/** Candidate for Codex's plan-only question tool; never call it outside its allowed mode. */
export function codexQuestion(input) {
  const card = choiceCard(input);
  if (card.multiSelect || card.options.length > 3) throw Error('Codex request_user_input supports two or three single-select suggestions');
  const options = [...card.options];
  if (card.recommendedId) options.sort((a, b) => Number(b.id === card.recommendedId) - Number(a.id === card.recommendedId));
  return {questions:[{id:card.id, header:card.header,
    question:card.question + (card.recommendationReason ? ` Recommendation: ${card.recommendationReason}` : ''),
    options:options.map(o => ({label:o.label + (o.id === card.recommendedId ? ' (Recommended)' : ''), description:o.description}))}]};
}
/** Candidate for hosts exposing the asynchronous question tool with built-in free text. */
export function asyncQuestion(input) {
  const card = choiceCard(input);
  if (card.multiSelect) throw Error('Asynchronous questions support single selection or custom text');
  const options = [...card.options];
  if (card.recommendedId) options.sort((a, b) => Number(b.id === card.recommendedId) - Number(a.id === card.recommendedId));
  return {questions:[{title:card.question + (card.recommendationReason ? ` Recommendation: ${card.recommendationReason}` : ''),
    options:options.map(o => `${o.label}${o.id === card.recommendedId ? ' (Recommended)' : ''}: ${o.description}`)}]};
}
export function presentQuestion(input, {host, nativeTool, nativeAvailable = false, nativeCustomInput = false,
  nativeAllowed = false, textOnly = false, freeform = false} = {}) {
  const card = choiceCard(input);
  if (freeform) return {mode:'text', text:card.question};
  // Capability and current-mode permission must both be confirmed from the live tool contract.
  if (nativeAvailable && nativeCustomInput && nativeAllowed && !textOnly) {
    if (host === 'claude' && nativeTool === 'AskUserQuestion')
      return {mode:'native-candidate', tool:nativeTool, payload:claudeQuestion(card)};
    if (['codex', 'chatgpt'].includes(host) && !card.multiSelect) {
      if (nativeTool === 'request_user_input_async')
        return {mode:'native-candidate', tool:nativeTool, payload:asyncQuestion(card)};
      if (host === 'codex' && nativeTool === 'request_user_input' && card.options.length <= 3)
        return {mode:'native-candidate', tool:nativeTool, payload:codexQuestion(card)};
    }
  }
  return {mode:'text', text:renderChoices(card)};
}
