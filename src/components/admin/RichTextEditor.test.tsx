import { render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { RichTextEditor } from './RichTextEditor';

it('loads saved formatting without executing HTML and accepts external content changes', async () => {
  const onChange = vi.fn();
  const { rerender } = render(<RichTextEditor value='<h2>Başlık</h2><p><strong>İçerik</strong></p><img src=x onerror="alert(1)">' onChange={onChange} />);
  const editor = await screen.findByRole('textbox', { name: 'Zengin metin içeriği' });
  expect(editor.querySelector('h2')?.textContent).toBe('Başlık');
  expect(editor.querySelector('strong')?.textContent).toBe('İçerik');
  expect(editor.innerHTML).not.toContain('onerror');
  rerender(<RichTextEditor value='<p>Güncellendi</p>' onChange={onChange} />);
  await waitFor(() => expect(editor).toHaveTextContent('Güncellendi'));
  expect(onChange).not.toHaveBeenCalled();
});
