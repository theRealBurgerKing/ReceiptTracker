'use client';

import { useParams } from 'next/navigation';
import React from 'react';

function Receipt() {
  const params = useParams<{  id: string  }>();
  return (
    <div>ReceiptPage{params.id}</div>
  )
}

export default Receipt