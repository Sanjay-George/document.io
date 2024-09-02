import { NextUIProvider } from "@nextui-org/system";
import { AntdRegistry } from '@ant-design/nextjs-registry';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <AntdRegistry>
        {children}
      </AntdRegistry>
    </NextUIProvider>
  )
}