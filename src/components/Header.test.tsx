import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import { fakeAnnotator } from '../test/fakeAnnotator';

describe('Header', () => {
  it('keeps the brand non-navigating in browser and Electron file pages', async () => {
    render(<Header vm={fakeAnnotator()} />);
    const brand = screen.getByLabelText('Frame Annotator');
    expect(brand.closest('a')).toBeNull();
    await userEvent.click(brand);
    expect(screen.getByRole('button', { name: /動画を開く/ })).toBeInTheDocument();
  });
  it('disables both buttons while busy loading a video', () => {
    render(<Header vm={fakeAnnotator({ busy: true, times: [0, 1] })} />);
    expect(screen.getByRole('button', { name: /動画を開く/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /CSV出力|CSVを書き出す/ })).toBeDisabled();
  });

  it('disables CSV export until a video has been opened', () => {
    render(<Header vm={fakeAnnotator({ times: [] })} />);
    expect(screen.getByRole('button', { name: /CSV出力/ })).toBeDisabled();
  });

  it('shows "CSVを書き出す" once every frame is reviewed, otherwise "CSV出力"', () => {
    const { rerender } = render(<Header vm={fakeAnnotator({ times: [0], complete: false })} />);
    expect(screen.getByText('CSV出力')).toBeInTheDocument();

    rerender(<Header vm={fakeAnnotator({ times: [0], complete: true })} />);
    expect(screen.getByText('CSVを書き出す')).toBeInTheDocument();
  });

  it('calls vm.exportCsv when the export button is clicked', async () => {
    const vm = fakeAnnotator({ times: [0] });
    render(<Header vm={vm} />);
    await userEvent.click(screen.getByRole('button', { name: /CSV出力/ }));
    expect(vm.exportCsv).toHaveBeenCalledTimes(1);
  });

  it('calls vm.openFile with the selected file', async () => {
    const vm = fakeAnnotator();
    render(<Header vm={vm} />);
    const file = new File(['dummy'], 'clip.mkv');
    await userEvent.upload(screen.getByLabelText('動画を選択'), file);
    expect(vm.openFile).toHaveBeenCalledWith(file);
  });
});
