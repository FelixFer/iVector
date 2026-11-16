export const relatedField = { id: 'relatedIds', name: 'relatedIds', type: 'Array', required: false, localized: false, items: { type: 'Symbol' } };

export async function ensureRelatedField(root, id, token, fetcher = fetch) {
  const path = `${root}/content_types/${id}`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/vnd.contentful.management.v1+json' };
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetcher(path, { headers });
    if (!response.ok) throw new Error(`Cannot inspect ${id}: ${response.status}`);
    const model = await response.json();
    const existing = model.fields.find(field => field.id === 'relatedIds');
    if (existing) {
      if (existing.type !== 'Array' || existing.items?.type !== 'Symbol' || existing.required || existing.disabled || existing.omitted || existing.localized) throw new Error(`Incompatible relatedIds field: ${id}`);
      if (model.sys.publishedVersion === undefined || model.sys.version !== model.sys.publishedVersion + 1) throw new Error(`Review and activate pending schema changes before updating ${id}`);
      return;
    }
    // Do not activate unrelated schema edits made by an editor.
    if (model.sys.publishedVersion === undefined || model.sys.version !== model.sys.publishedVersion + 1) throw new Error(`Review and activate pending schema changes before updating ${id}`);
    const body = { name: model.name, description: model.description, displayField: model.displayField, fields: [...model.fields, relatedField] };
    const updated = await fetcher(path, { method: 'PUT', headers: { ...headers, 'X-Contentful-Version': String(model.sys.version) }, body: JSON.stringify(body) });
    if (updated.status === 409 && attempt === 0) continue;
    if (!updated.ok) throw new Error(`Cannot update ${id}: ${updated.status}`);
    const saved = await updated.json();
    const activate = await fetcher(`${path}/published`, { method: 'PUT', headers: { ...headers, 'X-Contentful-Version': String(saved.sys.version) } });
    if (!activate.ok) throw new Error(`Cannot activate ${id}: ${activate.status}`);
    return;
  }
}
