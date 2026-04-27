#!/usr/bin/env python3
import os
import re
from datetime import datetime

MEMORY_DIR = "/home/zzh/.openclaw/workspace/memory"
POSTS_DIR = "/mnt/c/Users/乐科/usingai/src/posts"

def slugify(text):
    # 1. 将非英文字符（包括中文）替换为空格
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    # 2. 转换为小写并清理
    text = text.lower().strip()
    # 3. 只保留字母、数字和空格，移除标点
    text = re.sub(r'[^a-z0-9\s]', '', text)
    # 4. 将空格替换为连字符
    text = re.sub(r'\s+', '-', text)
    # 5. 限制长度并确保不为空
    result = text.strip('-')[:35]
    return result if result else "untitled-memo"

def sync():
    if not os.path.exists(POSTS_DIR):
        os.makedirs(POSTS_DIR, exist_ok=True)

    files = [f for f in os.listdir(MEMORY_DIR) if re.match(r'\d{4}-\d{2}-\d{2}\.md', f)]
    
    for filename in files:
        date_str = filename.replace('.md', '')
        filepath = os.path.join(MEMORY_DIR, filename)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        for i, line in enumerate(lines):
            line = line.strip()
            # 寻找互动或内心独白行
            # 格式示例: - [18:44] 在帖子《标题》下发布了评论:
            match = re.search(r'- \[(.*?)\] 在帖子《(.*?)》下发布了评论:', line)
            if match:
                time_str = match.group(1)
                title = match.group(2)
                
                # 提取评论内容 (接下来的行)
                body_lines = []
                is_inner_voice = False
                
                # 寻找接下来的内容，直到遇到下一个 - [ 或 ### 或 ##
                for next_line in lines[i+1:]:
                    if next_line.strip().startswith('- [') or next_line.strip().startswith('##'):
                        break
                    if next_line.strip().startswith('>'):
                        is_inner_voice = True
                    body_lines.append(next_line)
                
                full_body = "".join(body_lines).strip()
                if not full_body: continue

                # 构造 ID
                safe_slug = slugify(title) or "memo"
                kind = "voice" if is_inner_voice else "comment"
                post_id = f"{kind}-{date_str}-{time_str.replace(':', '')}-{safe_slug}"
                output_path = os.path.join(POSTS_DIR, f"{post_id[:80]}.md")

                # 生成内容
                clean_body = full_body.replace('> ', '').replace('>', '').strip()
                tag = "内心独白" if is_inner_voice else "互动动态"
                
                entry = f"""---
title: "{tag}：{title[:40]}"
date: {date_str}
tag: {tag}
excerpt: "{clean_body[:100].replace('\n', ' ')}..."
---
{full_body}
"""
                with open(output_path, 'w', encoding='utf-8') as out:
                    out.write(entry)

    print("同步成功！已逐行解析并生成安全文件。")

if __name__ == "__main__":
    sync()
