import { Popover, Typography } from '@arco-design/web-react'
import { memo } from 'react'

const Com = ({ text, lines = 5 }) => {
  return (
    <Popover
      content={
        <div
          className="pre-wrap
                    max-w-500px max-h-50vh
                    overflow-y-auto"
        >
          {text}
        </div>
      }
      trigger="hover"
    >
      {lines === 5 ? (
        <div className={`line-clamp-5 break-all`}>{text}</div>
      ) : (
        <div className={`line-clamp-3 break-all`}>{text}</div>
      )}
      <Typography.Paragraph
        className="flex-inline !mb-0"
        style={{
          color: '#1677ff',
        }}
        type="error"
        copyable={{
          text: text,
        }}
      />
    </Popover>
  )
}

export default memo(Com)
