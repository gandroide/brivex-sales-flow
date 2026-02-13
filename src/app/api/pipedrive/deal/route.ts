
import { NextRequest, NextResponse } from 'next/server';
import { dealsApi, personsApi } from '@/lib/pipedrive';

export async function POST(req: NextRequest) {
  try {
    const { title, value, client_name, stage } = await req.json();

    if (!title || !client_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Search for Person
    let personId: number | undefined;
    
    try {
      const personSearch = await personsApi.searchPersons({ term: client_name, limit: 1 });
      // searchPersons returns { data: { items: [...] } }
      // We need to check if items exist and have length
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const searchData = personSearch.data as any; // Bypass TS strict typing for response structure
      if (searchData && searchData.data && searchData.data.items && searchData.data.items.length > 0) {
        // The item structure in search results is usually { item: { id: 123, ... } }
        personId = searchData.data.items[0].item.id;
      } else {
        // Create new Person
        // addPerson expects AddPersonRequest object
        const newPerson = await personsApi.addPerson({ AddPersonRequest: { name: client_name } });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        personId = (newPerson.data as any)?.id; // Standard add response has data directly
      }
    } catch (err) {
      console.error('Error finding/creating person:', err);
      // Fallback: create deal without person or generic person
    }

    // 2. Map Stage to Pipedrive Status/Stage
    // Simple mapping: if stage is 'Won', set status='won'. Otherwise 'open'.
    const status = (stage === 'Won' ? 'won' : 'open') as 'open' | 'won' | 'lost' | 'deleted';

    // 3. Create Deal
    // addDeal expects AddDealRequest object
    const dealData = {
      title,
      value,
      person_id: personId,
      status,
      // org_id: ... could add organization logic
    };

    const newDeal = await dealsApi.addDeal({ AddDealRequest: dealData });

    return NextResponse.json({ success: true, deal: newDeal.data });

  } catch (error) {
    console.error('Pipedrive Error:', error);
    return NextResponse.json({ error: 'Failed to create deal in Pipedrive' }, { status: 500 });
  }
}
