import { describe, it, expect } from 'vitest';
import { escapeHtml, markdownToHtml } from './markdown';

describe('escapeHtml', () => {
  it('escapes the five XML / HTML metacharacters', () => {
    expect(escapeHtml('<script>"&\'</script>')).toBe(
      '&lt;script&gt;&quot;&amp;&#39;&lt;/script&gt;',
    );
  });

  it('leaves regular text untouched', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('markdownToHtml', () => {
  it('renders an H1 / H2 / H3', () => {
    expect(markdownToHtml('# A')).toBe('<h1>A</h1>');
    expect(markdownToHtml('## B')).toBe('<h2>B</h2>');
    expect(markdownToHtml('### C')).toBe('<h3>C</h3>');
  });

  it('renders unordered lists', () => {
    const md = '- one\n- two';
    expect(markdownToHtml(md)).toBe('<ul>\n<li>one</li>\n<li>two</li>\n</ul>');
  });

  it('renders numbered lists as <ul> for our limited needs', () => {
    const md = '1. one\n2. two';
    const html = markdownToHtml(md);
    expect(html).toContain('<li>one</li>');
    expect(html).toContain('<li>two</li>');
  });

  it('renders bold and italic inline', () => {
    const html = markdownToHtml('**bold** and *italic*');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('renders inline code', () => {
    const html = markdownToHtml('use `console.log` for output');
    expect(html).toContain('<code>console.log</code>');
  });

  it('escapes HTML metacharacters inside inline code', () => {
    const html = markdownToHtml('`<script>`');
    expect(html).toContain('<code>&lt;script&gt;</code>');
  });

  it('renders blockquotes', () => {
    expect(markdownToHtml('> quoted')).toContain('<blockquote>');
  });

  it('renders horizontal rules', () => {
    expect(markdownToHtml('---')).toContain('<hr/>');
  });

  it('escapes raw HTML in paragraphs', () => {
    const html = markdownToHtml('<script>alert(1)</script>');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('preserves the order of block elements', () => {
    const html = markdownToHtml('# Title\n\n- a\n- b\n\n## Sub\n\nbody');
    expect(html.indexOf('<h1>')).toBeLessThan(html.indexOf('<ul>'));
    expect(html.indexOf('<ul>')).toBeLessThan(html.indexOf('<h2>'));
    expect(html.indexOf('<h2>')).toBeLessThan(html.indexOf('<p>body</p>'));
  });

  it('handles a mix of headings, list, and quote in one document', () => {
    const md = `# Run summary\n\n- decision 1\n- decision 2\n\n> stylised simulation\n\n---\n\nfooter line`;
    const html = markdownToHtml(md);
    expect(html).toContain('<h1>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<hr/>');
    expect(html).toContain('<p>footer line</p>');
  });
});
