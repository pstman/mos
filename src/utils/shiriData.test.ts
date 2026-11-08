import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSlug,
  clampEqGain,
  clampCardScale,
  paginateItems,
  formatTimecode,
  compileCustomTemplate,
  filterTracks,
  validateUploadSize,
  DEFAULT_SITE_DATA,
} from './shiriData';

describe('shiriData pure logic unit tests', () => {
  it('createSlug generates clean slugs for Persian and English titles', () => {
    assert.equal(createSlug('بیا کنارم'), 'بیا-کنارم');
    assert.equal(createSlug('  Mostafa Shiri - To Delami To! '), 'mostafa-shiri-to-delami-to');
  });

  it('clampEqGain clamps values strictly between -12 and +12 dB with 0.5dB steps', () => {
    assert.equal(clampEqGain(18), 12);
    assert.equal(clampEqGain(-20), -12);
    assert.equal(clampEqGain(3.5), 3.5);
    assert.equal(clampEqGain(Number.NaN), 0);
  });

  it('clampCardScale clamps card size percentage between 70% and 115%', () => {
    assert.equal(clampCardScale(50), 70);
    assert.equal(clampCardScale(130), 115);
    assert.equal(clampCardScale(88.4), 88);
  });

  it('paginateItems slices items into pages of 2 by default', () => {
    const page1 = paginateItems(DEFAULT_SITE_DATA.tracks, 1, 2);
    assert.equal(page1.pagedItems.length, 2);
    assert.equal(page1.totalPages, 2);
    assert.equal(page1.pagedItems[0].slug, 'bia-kenaram');
    assert.equal(page1.pagedItems[1].slug, 'to-delami-to');

    const page2 = paginateItems(DEFAULT_SITE_DATA.tracks, 2, 2);
    assert.equal(page2.pagedItems.length, 2);
    assert.equal(page2.pagedItems[0].slug, 'rhythmic-bounce');
  });

  it('formatTimecode formats seconds into tabular MM:SS', () => {
    assert.equal(formatTimecode(0), '00:00');
    assert.equal(formatTimecode(65), '01:05');
    assert.equal(formatTimecode(222.8), '03:42');
    assert.equal(formatTimecode(-5), '00:00');
  });

  it('compileCustomTemplate replaces dynamic tags with live site data', () => {
    const tpl = '[artist-name] ([artist-name-en]) - [tracks-count] tracks';
    const result = compileCustomTemplate(tpl, DEFAULT_SITE_DATA);
    assert.equal(result, 'مصطفی شیری (MOSTAFA SHIRI) - 4 tracks');
  });

  it('filterTracks filters by category and search query on real tracks', () => {
    const all = filterTracks(DEFAULT_SITE_DATA.tracks, 'all');
    assert.equal(all.length, 4);

    const searched = filterTracks(DEFAULT_SITE_DATA.tracks, 'all', 'تو دلمی');
    assert.equal(searched.length, 1);
    assert.equal(searched[0].slug, 'to-delami-to');
  });

  it('validateUploadSize enforces max MB limit matching reference HTML constraints', () => {
    assert.equal(validateUploadSize(500 * 1024, 1.5).valid, true);
    assert.equal(validateUploadSize(2 * 1024 * 1024, 1.5).valid, false);
    assert.equal(validateUploadSize(0, 2).valid, false);
  });
});
