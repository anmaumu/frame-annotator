import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClassPanel } from './ClassPanel';
import { fakeAnnotator } from '../test/fakeAnnotator';

describe('ClassPanel', () => {
  it('renders each class with its keyboard shortcut', () => {
    render(<ClassPanel vm={fakeAnnotator()} />);
    expect(screen.getByText('異常クラス A')).toBeInTheDocument();
    expect(screen.getByText('異常クラス B')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows a class as selected when the current row has that flag on', () => {
    const vm = fakeAnnotator({ row: { reviewed: false, flags: [1, 0] } });
    render(<ClassPanel vm={vm} />);
    expect(screen.getByRole('button', { name: /異常クラス A/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /異常クラス B/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls vm.toggle with the class index when a class button is clicked', async () => {
    const vm = fakeAnnotator();
    render(<ClassPanel vm={vm} />);
    await userEvent.click(screen.getByRole('button', { name: /異常クラス B/ }));
    expect(vm.toggle).toHaveBeenCalledWith(1);
  });

  it('disables the confirm and undo buttons when inactive', () => {
    const vm = fakeAnnotator({ active: false });
    render(<ClassPanel vm={vm} />);
    expect(screen.getByRole('button', { name: /確認して次へ/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /ラベル変更を元に戻す/ })).toBeDisabled();
  });

  it('disables undo when there is no history even while active', () => {
    const vm = fakeAnnotator({ active: true, historyLength: 0 });
    render(<ClassPanel vm={vm} />);
    expect(screen.getByRole('button', { name: /ラベル変更を元に戻す/ })).toBeDisabled();
  });

  it('shows "確認済み" only once the current frame has been confirmed', () => {
    const { rerender } = render(<ClassPanel vm={fakeAnnotator({ row: { reviewed: false, flags: [0, 0] } })} />);
    expect(screen.getByText('未確認')).toBeInTheDocument();

    rerender(<ClassPanel vm={fakeAnnotator({ row: { reviewed: true, flags: [0, 0] } })} />);
    expect(screen.getByText('確認済み')).toBeInTheDocument();
  });
});
