import { useState, useCallback } from 'react';

// Common ESC/POS commands map
const ESC = 0x1b;
const GS = 0x1d;
const COMMANDS = {
  INIT: [ESC, 0x40],
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],
  TEXT_BOLD_ON: [ESC, 0x45, 0x01],
  TEXT_BOLD_OFF: [ESC, 0x45, 0x00],
  DOUBLE_HEIGHT_ON: [ESC, 0x21, 0x10],
  DOUBLE_WIDTH_ON: [ESC, 0x21, 0x20],
  DOUBLE_SIZE_ON: [ESC, 0x21, 0x30],
  NORMAL_SIZE: [ESC, 0x21, 0x00],
  CUT: [GS, 0x56, 0x41, 0x10],
};

const NEWLINE = '\x0A';

export default function useBluetoothPrinter() {
  const [device, setDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth is not supported in this browser. Please use Chrome on Android/Mac/PC.');
      }

      const btDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        optionalServices: ['0000e781-0000-1000-8000-00805f9b34fb']
      });

      const server = await btDevice.gatt.connect();
      // Using generic service IDs for unbranded mini thermal printers from Chinese OEMs
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const char = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      setDevice(btDevice);
      setCharacteristic(char);

      btDevice.addEventListener('gattserverdisconnected', () => {
        setDevice(null);
        setCharacteristic(null);
      });

    } catch (err) {
      console.error('BT Print Error:', err);
      setError(err.message || 'Failed to connect to printer.');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const _sendData = async (dataArray) => {
    if (!characteristic) return;
    const chunk = 512;
    for (let i = 0; i < dataArray.length; i += chunk) {
      const buf = new Uint8Array(dataArray.slice(i, i + chunk));
      await characteristic.writeValue(buf);
    }
  };

  const printReceipt = useCallback(async (billInfo) => {
    if (!characteristic) {
      setError('Not connected');
      return;
    }

    try {
      let payload = [];
      const addCmd = (cmd) => payload.push(...cmd);
      const addText = (text) => {
        // Basic UTF-8 to ascii conversion for ESC/POS
        for (let i = 0; i < text.length; i++) {
          payload.push(text.charCodeAt(i));
        }
      };

      // Header
      addCmd(COMMANDS.INIT);
      addCmd(COMMANDS.ALIGN_CENTER);
      addCmd(COMMANDS.TEXT_BOLD_ON);
      addCmd(COMMANDS.DOUBLE_SIZE_ON);
      addText('SHARMA KIRANA\n');
      addCmd(COMMANDS.NORMAL_SIZE);
      addCmd(COMMANDS.TEXT_BOLD_OFF);
      
      addText('Sonipat, Haryana\n');
      addText(`Date: ${new Date().toLocaleString('en-IN')}\n`);
      addText(`Bill No: ${billInfo.id || 'N/A'}\n`);
      addText('-'.repeat(32) + '\n');
      
      // Items
      addCmd(COMMANDS.ALIGN_LEFT);
      billInfo.cartItems.forEach(item => {
        addText(`${item.name}\n`);
        const qtyTxt = `${item.qty} x ${item.price}`;
        const totalTxt = `${item.qty * item.price}`;
        // Pad right
        const paddedQty = qtyTxt.padEnd(24, ' ');
        // Right align total
        const finalLine = paddedQty + totalTxt.padStart(8, ' ');
        addText(finalLine + '\n');
      });
      
      addCmd(COMMANDS.ALIGN_CENTER);
      addText('-'.repeat(32) + '\n');
      
      addCmd(COMMANDS.DOUBLE_HEIGHT_ON);
      addCmd(COMMANDS.TEXT_BOLD_ON);
      addText(`TOTAL: Rs ${billInfo.total}\n`);
      addCmd(COMMANDS.NORMAL_SIZE);
      addCmd(COMMANDS.TEXT_BOLD_OFF);
      
      addText('-'.repeat(32) + '\n');
      addText(billInfo.paymentType === 'Khata' ? 'Billed on Khata\n' : `By: ${billInfo.paymentType}\n`);
      addText('\nThanks for shopping with us!\nPowered by OneFlow\n');
      
      // Feed paper and cut
      addText('\n\n\n');
      addCmd(COMMANDS.CUT);

      await _sendData(payload);
    } catch (err) {
      console.error(err);
      setError('Error printing');
    }
  }, [characteristic]);

  const disconnect = useCallback(() => {
    if (device?.gatt.connected) {
      device.gatt.disconnect();
    }
    setDevice(null);
    setCharacteristic(null);
  }, [device]);

  return {
    isConnecting,
    isConnected: !!characteristic,
    error,
    connect,
    disconnect,
    printReceipt
  };
}
