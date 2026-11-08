import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSlug,
  clampEqGain,
  formatTimecode,
  compileRozblogTemplate,
  filterTracks,
  validateUploadSize,
  DEFAULT_SITE_DATA,
} from './shiriData';

describe('shiriData pure logic unit tests', () => {
  it('createSlug generates clean slugs for Persian and English titles', () => {
    assert.equal(createSlug('شب‌های بارانی تهران'), 'شبهای-بارانی-تهران');
    assert.equal(createSlug('  Mostafa Shiri Live 2026! '), 'mostafa-shiri-live-2026');
  });

  it('clampEqGain clamps values strictly between -12 and +12 dB with 0.5dB steps', () => {
    assert.equal(clampEqGain(18), 12);
    assert.equal(clampEqGain(-20), -12);
    assert.equal(clampEqGain(3.5), 3.5);
    assert.equal(clampEqGain(Number.NaN), 0);
  });

  it('formatTimecode formats seconds into tabular MM:SS', () => {
    assert.equal(formatTimecode(0), '00:00');
    assert.equal(formatTimecode(65), '01:05');
    assert.equal(formatTimecode(222.8), '03:42');
    assert.equal(formatTimecode(-5), '00:00');
  });

  it('compileRozblogTemplate replaces Rozblog tags with live site data', () => {
    const tpl = '[artist-name] ([artist-name-en]) - [tracks-count] tracks';
    const result = compileRozblogTemplate(tpl, DEFAULT_SITE_DATA);
    assert.equal(result, 'مصطفی شیری (MOSTAFA SHIRI) - 4 tracks');
  });

  it('filterTracks filters by category and search query', () => {
    const all = filterTracks(DEFAULT_SITE_DATA.tracks, 'all');
    assert.equal(all.length, 4);

    const collabs = filterTracks(DEFAULT_SITE_DATA.tracks, 'collaboration');
    assert.equal(collabs.length, 1);
    assert.equal(collabs[0].slug, 'sayeh-roshan-piano');

    const searched = filterTracks(DEFAULT_SITE_DATA.tracks, 'all', 'بارانی');
    assert.equal(searched.length, 1);
    assert.equal(searched[0].id, 'trk-1');
  });

  it('validateUploadSize enforces max MB limit matching reference HTML constraints', () => {
    assert.equal(validateUploadSize(500 * 1024, 1.5).valid, true);
    assert.equal(validateUploadSize(2 * 1024 * 1024, 1.5).valid, false);
    assert.equal(validateUploadSize(0, 2).valid, false);
  });
});
