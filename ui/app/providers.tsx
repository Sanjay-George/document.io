import { HeroUIProvider } from "@heroui/system";
import { AntdRegistry } from '@ant-design/nextjs-registry';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AntdRegistry>
        {children}
      </AntdRegistry>
    </HeroUIProvider>
  )
}