import { useState } from 'react';
import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,describe,it,expect } from 'vitest';
import { NumericInput } from './NumericInput';
afterEach(cleanup);
function Form(){const [value,setValue]=useState(0);return <><NumericInput aria-label="Fiyat" value={value} onValueChange={setValue}/><output>{Number.isFinite(value)?value:'invalid'}</output><button disabled={!Number.isFinite(value)}>Kaydet</button></>;}
describe('editable pricing numbers',()=>{
 it('allows deleting zero and entering a new decimal without resetting the editing buffer',()=>{
  render(<Form/>);const input=screen.getByLabelText('Fiyat');
  fireEvent.change(input,{target:{value:''}});expect(input).toHaveValue('');expect(screen.getByRole('button')).toBeDisabled();
  for(const value of ['1','1,','1,2','1,24']){fireEvent.change(input,{target:{value}});expect(input).toHaveValue(value);}
  expect(screen.getByRole('status')).toHaveTextContent('1.24');expect(screen.getByRole('button')).toBeEnabled();
  fireEvent.change(input,{target:{value:'0'}});expect(screen.getByRole('status')).toHaveTextContent('0');expect(screen.getByRole('button')).toBeEnabled();
 });
 it('keeps invalid drafts visible while preventing them from becoming zero prices',()=>{
  render(<Form/>);const input=screen.getByLabelText('Fiyat');fireEvent.change(input,{target:{value:'abc'}});
  expect(input).toHaveValue('abc');expect(input).toHaveAttribute('aria-invalid','true');expect(screen.getByRole('button')).toBeDisabled();
 });
});
