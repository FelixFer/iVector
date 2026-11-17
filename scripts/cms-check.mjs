import { readPublished, downloadAsset, storage, required, reportFailure } from './cms-common.mjs';

try {
  const published = await readPublished();
  let client;
  try {
    if (published.assets.length) client = storage();
    for (const asset of published.assets) await downloadAsset(client, required('CMS_STORAGE_BUCKET'), asset);
  } finally { client?.destroy(); }
  console.log('Published content and referenced images are valid. No files changed.');
} catch (error) { reportFailure(error); }
