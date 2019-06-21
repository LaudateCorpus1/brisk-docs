import path from 'path';
import { copyFixtureIntoTempDir } from 'jest-fixtures';

import getDocsInfo from './get-docs-info';

describe('Get docs info utility', () => {
  let cwd;
  let docsInfo;

  beforeAll(async () => {
    cwd = await copyFixtureIntoTempDir(__dirname, 'simple-mock-docs');
    docsInfo = getDocsInfo(path.join(cwd, 'docs'));
  });

  it('returns an array of all the pages in the docs folder', () => {
    expect(docsInfo[0]).toMatchObject({
      id: 'doc-1',
      path: path.join(cwd, 'docs', 'doc-1.md'),
    });
    expect(docsInfo[1]).toMatchObject({
      id: 'doc-2',
      path: path.join(cwd, 'docs', 'doc-2.md'),
    });
  });

  it('reads nested files within the docs', () => {
    expect(docsInfo[2]).toMatchObject({
      id: 'doc-3',
      children: [
        {
          id: 'doc-3-1',
          path: path.join(cwd, 'docs', 'doc-3', 'doc-3-1.md'),
        },
        {
          id: 'doc-3-2',
          children: [
            {
              id: 'doc-3-2-1',
              path: path.join(cwd, 'docs', 'doc-3', 'doc-3-2', 'doc-3-2-1.md'),
            },
          ],
        },
      ],
    });
  });

  it('gets meta for all docs pages', () => {
    expect(docsInfo[0].meta).toEqual({ title: 'Document One' });
    expect(docsInfo[1].meta).toEqual({});
    expect(docsInfo[2].meta).toBeUndefined();

    // nested docs
    expect(docsInfo[2].children[0].meta).toEqual({
      readingTime: '1 second',
    });
    expect(docsInfo[2].children[1].meta).toBeUndefined();
    expect(docsInfo[2].children[1].children[0].meta).toEqual({
      usefulness: 'yes',
    });
  });
});

describe('Missing docs directory', () => {
  let cwd;
  let docsInfo;

  beforeAll(async () => {
    cwd = await copyFixtureIntoTempDir(__dirname, 'simple-mock-packages');
    docsInfo = getDocsInfo(path.join(cwd, 'docs'));
  });

  it('should return null if the docs folder does not exist', () => {
    expect(docsInfo).toBeNull();
  });
});

describe('docs-with-readmes', () => {
  let cwd;
  let docsInfo;

  beforeAll(async () => {
    cwd = await copyFixtureIntoTempDir(__dirname, 'docs-with-readme');
    docsInfo = getDocsInfo(path.join(cwd, 'docs'));
  });

  it('should replace the base index page with the readme page', () => {
    expect(docsInfo[2]).toMatchObject({
      id: 'doc-3',
      children: [
        {
          id: 'doc-3-2',
          children: [
            {
              id: 'README',
              path: path.join(cwd, 'docs', 'doc-3', 'doc-3-2', 'README.md'),
            },
          ],
        },
        {
          id: 'readme',
          path: path.join(cwd, 'docs', 'doc-3', 'readme.md'),
        },
      ],
    });
  });
});

describe('Test exclude everything that are non md files', () => {
  let cwd;
  let docsInfo;

  beforeAll(async () => {
    cwd = await copyFixtureIntoTempDir(__dirname, 'mock-docs-with-assets');
    docsInfo = getDocsInfo(path.join(cwd, 'docs'));
  });

  it('returns an array of all the pages in the docs folder excluding non md files', () => {
    expect(docsInfo[0]).toMatchObject({
      id: 'doc-2',
      path: path.join(cwd, 'docs', 'doc-2.md'),
    });
    expect(docsInfo[1]).toMatchObject({
      id: 'sub-docs',
      children: [
        {
          id: 'doc-1',
          path: path.join(cwd, 'docs', 'sub-docs', 'doc-1.md'),
        },
      ],
    });
  });
});

describe('Custom doc sorting', () => {
  let cwd;
  let docsInfo;

  beforeAll(async () => {
    cwd = await copyFixtureIntoTempDir(__dirname, 'mock-docs-with-sorting');
    docsInfo = getDocsInfo(path.join(cwd, 'docs'));
  });

  it('sorts doc-2 before doc-1 in top-level docs folder', () => {
    expect(docsInfo[0]).toMatchObject({
      id: 'doc-2',
    });
    expect(docsInfo[1]).toMatchObject({
      id: 'doc-1',
    });
    expect(docsInfo[2]).toMatchObject({
      id: 'doc-3',
    });
  });

  it('sorts nested doc-3-2 before doc-3-1', () => {
    const docs3Children = docsInfo[2].children;
    expect(docs3Children[0]).toMatchObject({
      id: 'doc-3-2',
    });
    expect(docs3Children[1]).toMatchObject({
      id: 'doc-3-1',
    });
  });
});
